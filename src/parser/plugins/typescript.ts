import {
  ContextualKeyword,
  eat,
  lookaheadType,
  lookaheadTypeAndKeyword,
  match,
  next,
  popTypeContext,
  pushTypeContext,
} from "../tokenizer/index";
import {TokenType, TokenType as tt} from "../tokenizer/types";
import {isJSXEnabled, state} from "../traverser/base";
import {
  atPossibleAsync,
  baseParseMaybeAssign,
  baseParseSubscript,
  parseCallExpressionArguments,
  parseExprAtom,
  parseExpression,
  parseFunctionBody,
  parseIdentifier,
  parseLiteral,
  parseMaybeAssign,
  parseMaybeUnary,
  parsePropertyName,
  parseTemplate,
  StopState,
} from "../traverser/expression";
import {parseBindingList} from "../traverser/lval";
import {
  baseParseMaybeDecoratorArguments,
  parseBlockBody,
  parseClass,
  parseClassProperty,
  parseClassPropertyName,
  parseFunction,
  parseFunctionParams,
  parsePostMemberNameModifiers,
  parseStatement,
  parseVarStatement,
} from "../traverser/statement";
import {
  canInsertSemicolon,
  eatContextual,
  expect,
  expectContextual,
  hasPrecedingLineBreak,
  isContextual,
  isLineTerminator,
  isLookaheadContextual,
  semicolon,
  unexpected,
} from "../traverser/util";
import {nextJSXTagToken} from "./jsx";

function tsIsIdentifier(): boolean {
  // TODO: actually a bit more complex in TypeScript, but shouldn't matter.
  // See https://github.com/Microsoft/TypeScript/issues/15008
  return match(tt.name);
}

function tsNextTokenCanFollowModifier(): boolean {
  // Note: TypeScript's implementation is much more complicated because
  // more things are considered modifiers there.
  // This implementation only handles modifiers not handled by babylon itself. And "static".
  // TODO: Would be nice to avoid lookahead. Want a hasLineBreakUpNext() method...
  const snapshot = state.snapshot();

  next();
  const canFollowModifier =
    !hasPrecedingLineBreak() &&
    !match(tt.parenL) &&
    !match(tt.parenR) &&
    !match(tt.colon) &&
    !match(tt.eq) &&
    !match(tt.question);

  if (canFollowModifier) {
    return true;
  } else {
    state.restoreFromSnapshot(snapshot);
    return false;
  }
}

/** Parses a modifier matching one the given modifier names. */
export function tsParseModifier(
  allowedModifiers: Array<ContextualKeyword>,
): ContextualKeyword | null {
  if (!match(tt.name)) {
    return null;
  }

  const modifier = state.contextualKeyword;
  if (allowedModifiers.indexOf(modifier) !== -1 && tsNextTokenCanFollowModifier()) {
    switch (modifier) {
      case ContextualKeyword._readonly:
        state.tokens[state.tokens.length - 1].type = tt._readonly;
        break;
      case ContextualKeyword._abstract:
        state.tokens[state.tokens.length - 1].type = tt._abstract;
        break;
      case ContextualKeyword._static:
        state.tokens[state.tokens.length - 1].type = tt._static;
        break;
      case ContextualKeyword._public:
        state.tokens[state.tokens.length - 1].type = tt._public;
        break;
      case ContextualKeyword._private:
        state.tokens[state.tokens.length - 1].type = tt._private;
        break;
      case ContextualKeyword._protected:
        state.tokens[state.tokens.length - 1].type = tt._protected;
        break;
      default:
        break;
    }
    return modifier;
  }
  return null;
}

function tsParseEntityName(): void {
  parseIdentifier();
  while (eat(tt.dot)) {
    parseIdentifier();
  }
}

function tsParseTypeReference(): void {
  tsParseEntityName();
  if (!hasPrecedingLineBreak() && match(tt.lessThan)) {
    tsParseTypeArguments();
  }
}

function tsParseThisTypePredicate(): void {
  next();
  tsParseTypeAnnotation();
}

function tsParseThisTypeNode(): void {
  next();
}

function tsParseTypeQuery(): void {
  expect(tt._typeof);
  tsParseEntityName();
}

function tsParseTypeParameter(): void {
  parseIdentifier();
  if (eat(tt._extends)) {
    tsParseType();
  }
  if (eat(tt.eq)) {
    tsParseType();
  }
}

export function tsTryParseTypeParameters(): void {
  if (match(tt.lessThan)) {
    tsParseTypeParameters();
  }
}

function tsParseTypeParameters(): void {
  const oldIsType = pushTypeContext(0);
  if (match(tt.lessThan) || match(tt.typeParameterStart)) {
    next();
  } else {
    unexpected();
  }

  while (!eat(tt.greaterThan) && !state.error) {
    tsParseTypeParameter();
    eat(tt.comma);
  }
  popTypeContext(oldIsType);
}

// Note: In TypeScript implementation we must provide `yieldContext` and `awaitContext`,
// but here it's always false, because this is only used for types.
function tsFillSignature(returnToken: TokenType): void {
  // Arrow fns *must* have return token (`=>`). Normal functions can omit it.
  const returnTokenRequired = returnToken === tt.arrow;
  tsTryParseTypeParameters();
  expect(tt.parenL);
  tsParseBindingListForSignature(false /* isBlockScope */);
  if (returnTokenRequired) {
    tsParseTypeOrTypePredicateAnnotation(returnToken);
  } else if (match(returnToken)) {
    tsParseTypeOrTypePredicateAnnotation(returnToken);
  }
}

function tsParseBindingListForSignature(isBlockScope: boolean): void {
  parseBindingList(tt.parenR, isBlockScope);
}

function tsParseTypeMemberSemicolon(): void {
  if (!eat(tt.comma)) {
    semicolon();
  }
}

enum SignatureMemberKind {
  TSCallSignatureDeclaration,
  TSConstructSignatureDeclaration,
}

function tsParseSignatureMember(kind: SignatureMemberKind): void {
  if (kind === SignatureMemberKind.TSConstructSignatureDeclaration) {
    expect(tt._new);
  }
  tsFillSignature(tt.colon);
  tsParseTypeMemberSemicolon();
}

function tsIsUnambiguouslyIndexSignature(): boolean {
  const snapshot = state.snapshot();
  next(); // Skip '{'
  const isIndexSignature = eat(tt.name) && match(tt.colon);
  state.restoreFromSnapshot(snapshot);
  return isIndexSignature;
}

function tsTryParseIndexSignature(): boolean {
  if (!(match(tt.bracketL) && tsIsUnambiguouslyIndexSignature())) {
    return false;
  }

  const oldIsType = pushTypeContext(0);

  expect(tt.bracketL);
  parseIdentifier();
  tsParseTypeAnnotation();
  expect(tt.bracketR);

  tsTryParseTypeAnnotation();
  tsParseTypeMemberSemicolon();

  popTypeContext(oldIsType);
  return true;
}

function tsParsePropertyOrMethodSignature(isReadonly: boolean): void {
  parsePropertyName(-1 /* Types don't need context IDs. */);
  eat(tt.question);

  if (!isReadonly && (match(tt.parenL) || match(tt.lessThan))) {
    tsFillSignature(tt.colon);
    tsParseTypeMemberSemicolon();
  } else {
    tsTryParseTypeAnnotation();
    tsParseTypeMemberSemicolon();
  }
}

function tsParseTypeMember(): void {
  if (match(tt.parenL) || match(tt.lessThan)) {
    tsParseSignatureMember(SignatureMemberKind.TSCallSignatureDeclaration);
    return;
  }
  if (match(tt._new) && tsIsStartOfConstructSignature()) {
    tsParseSignatureMember(SignatureMemberKind.TSConstructSignatureDeclaration);
    return;
  }
  const readonly = !!tsParseModifier([ContextualKeyword._readonly]);

  const found = tsTryParseIndexSignature();
  if (found) {
    return;
  }
  tsParsePropertyOrMethodSignature(readonly);
}

function tsIsStartOfConstructSignature(): boolean {
  const lookahead = lookaheadType();
  return lookahead === tt.parenL || lookahead === tt.lessThan;
}

function tsParseTypeLiteral(): void {
  tsParseObjectTypeMembers();
}

function tsParseObjectTypeMembers(): void {
  expect(tt.braceL);
  while (!eat(tt.braceR) && !state.error) {
    tsParseTypeMember();
  }
}

function tsLookaheadIsStartOfMappedType(): boolean {
  const snapshot = state.snapshot();
  const isStartOfMappedType = tsIsStartOfMappedType();
  state.restoreFromSnapshot(snapshot);
  return isStartOfMappedType;
}

function tsIsStartOfMappedType(): boolean {
  next();
  if (eat(tt.plus) || eat(tt.minus)) {
    return isContextual(ContextualKeyword._readonly);
  }
  if (isContextual(ContextualKeyword._readonly)) {
    next();
  }
  if (!match(tt.bracketL)) {
    return false;
  }
  next();
  if (!tsIsIdentifier()) {
    return false;
  }
  next();
  return match(tt._in);
}

function tsParseMappedTypeParameter(): void {
  parseIdentifier();
  expect(tt._in);
  tsParseType();
}

function tsParseMappedType(): void {
  expect(tt.braceL);
  if (match(tt.plus) || match(tt.minus)) {
    next();
    expectContextual(ContextualKeyword._readonly);
  } else {
    eatContextual(ContextualKeyword._readonly);
  }
  expect(tt.bracketL);
  tsParseMappedTypeParameter();
  expect(tt.bracketR);
  if (match(tt.plus) || match(tt.minus)) {
    next();
    expect(tt.question);
  } else {
    eat(tt.question);
  }
  tsTryParseType();
  semicolon();
  expect(tt.braceR);
}

function tsParseTupleType(): void {
  expect(tt.bracketL);
  while (!eat(tt.bracketR) && !state.error) {
    tsParseTupleElementType();
    eat(tt.comma);
  }
}

function tsParseTupleElementType(): void {
  // parses `...TsType[]`
  if (eat(tt.ellipsis)) {
    tsParseType();
    return;
  }
  // parses `TsType?`
  tsParseType();
  eat(tt.question);
}

function tsParseParenthesizedType(): void {
  expect(tt.parenL);
  tsParseType();
  expect(tt.parenR);
}

enum FunctionType {
  TSFunctionType,
  TSConstructorType,
}

function tsParseFunctionOrConstructorType(type: FunctionType): void {
  if (type === FunctionType.TSConstructorType) {
    expect(tt._new);
  }
  tsFillSignature(tt.arrow);
}

function tsParseNonArrayType(): void {
  switch (state.type) {
    case tt.name:
      tsParseTypeReference();
      return;
    case tt._void:
    case tt._null:
      next();
      return;
    case tt.string:
    case tt.num:
    case tt._true:
    case tt._false:
      parseLiteral();
      return;
    case tt.minus:
      next();
      parseLiteral();
      return;
    case tt._this: {
      tsParseThisTypeNode();
      if (isContextual(ContextualKeyword._is) && !hasPrecedingLineBreak()) {
        tsParseThisTypePredicate();
      }
      return;
    }
    case tt._typeof:
      tsParseTypeQuery();
      return;
    case tt.braceL:
      if (tsLookaheadIsStartOfMappedType()) {
        tsParseMappedType();
      } else {
        tsParseTypeLiteral();
      }
      return;
    case tt.bracketL:
      tsParseTupleType();
      return;
    case tt.parenL:
      tsParseParenthesizedType();
      return;
    default:
      break;
  }

  unexpected();
}

function tsParseArrayTypeOrHigher(): void {
  tsParseNonArrayType();
  while (!hasPrecedingLineBreak() && eat(tt.bracketL)) {
    if (!eat(tt.bracketR)) {
      // If we hit ] immediately, this is an array type, otherwise it's an indexed access type.
      tsParseType();
      expect(tt.bracketR);
    }
  }
}

function tsParseInferType(): void {
  expectContextual(ContextualKeyword._infer);
  parseIdentifier();
}

function tsParseTypeOperatorOrHigher(): void {
  if (isContextual(ContextualKeyword._keyof) || isContextual(ContextualKeyword._unique)) {
    next();
    tsParseTypeOperatorOrHigher();
  } else if (isContextual(ContextualKeyword._infer)) {
    tsParseInferType();
  } else {
    tsParseArrayTypeOrHigher();
  }
}

function tsParseIntersectionTypeOrHigher(): void {
  eat(tt.bitwiseAND);
  tsParseTypeOperatorOrHigher();
  if (match(tt.bitwiseAND)) {
    while (eat(tt.bitwiseAND)) {
      tsParseTypeOperatorOrHigher();
    }
  }
}

function tsParseUnionTypeOrHigher(): void {
  eat(tt.bitwiseOR);
  tsParseIntersectionTypeOrHigher();
  if (match(tt.bitwiseOR)) {
    while (eat(tt.bitwiseOR)) {
      tsParseIntersectionTypeOrHigher();
    }
  }
}

function tsIsStartOfFunctionType(): boolean {
  if (match(tt.lessThan)) {
    return true;
  }
  return match(tt.parenL) && tsLookaheadIsUnambiguouslyStartOfFunctionType();
}

function tsSkipParameterStart(): boolean {
  if (match(tt.name) || match(tt._this)) {
    next();
    return true;
  }
  // If this is a possible array/object destructure, walk to the matching bracket/brace.
  // The next token after will tell us definitively whether this is a function param.
  if (match(tt.braceL) || match(tt.bracketL)) {
    let depth = 1;
    next();
    while (depth > 0 && !state.error) {
      if (match(tt.braceL) || match(tt.bracketL)) {
        depth++;
      } else if (match(tt.braceR) || match(tt.bracketR)) {
        depth--;
      }
      next();
    }
    return true;
  }
  return false;
}

function tsLookaheadIsUnambiguouslyStartOfFunctionType(): boolean {
  const snapshot = state.snapshot();
  const isUnambiguouslyStartOfFunctionType = tsIsUnambiguouslyStartOfFunctionType();
  state.restoreFromSnapshot(snapshot);
  return isUnambiguouslyStartOfFunctionType;
}

function tsIsUnambiguouslyStartOfFunctionType(): boolean {
  next();
  if (match(tt.parenR) || match(tt.ellipsis)) {
    // ( )
    // ( ...
    return true;
  }
  if (tsSkipParameterStart()) {
    if (match(tt.colon) || match(tt.comma) || match(tt.question) || match(tt.eq)) {
      // ( xxx :
      // ( xxx ,
      // ( xxx ?
      // ( xxx =
      return true;
    }
    if (match(tt.parenR)) {
      next();
      if (match(tt.arrow)) {
        // ( xxx ) =>
        return true;
      }
    }
  }
  return false;
}

function tsParseTypeOrTypePredicateAnnotation(returnToken: TokenType): void {
  const oldIsType = pushTypeContext(0);
  expect(returnToken);
  tsParseTypePredicatePrefix();
  // Regardless of whether we found an "is" token, there's now just a regular type in front of
  // us.
  tsParseType();
  popTypeContext(oldIsType);
}

function tsTryParseTypeOrTypePredicateAnnotation(): void {
  if (match(tt.colon)) {
    tsParseTypeOrTypePredicateAnnotation(tt.colon);
  }
}

export function tsTryParseTypeAnnotation(): void {
  if (match(tt.colon)) {
    tsParseTypeAnnotation();
  }
}

function tsTryParseType(): void {
  if (eat(tt.colon)) {
    tsParseType();
  }
}

function tsParseTypePredicatePrefix(): void {
  const snapshot = state.snapshot();
  parseIdentifier();
  if (isContextual(ContextualKeyword._is) && !hasPrecedingLineBreak()) {
    next();
  } else {
    state.restoreFromSnapshot(snapshot);
  }
}

export function tsParseTypeAnnotation(): void {
  const oldIsType = pushTypeContext(0);
  expect(tt.colon);
  tsParseType();
  popTypeContext(oldIsType);
}

export function tsParseType(): void {
  tsParseNonConditionalType();
  if (hasPrecedingLineBreak() || !eat(tt._extends)) {
    return;
  }
  // extends type
  tsParseNonConditionalType();
  expect(tt.question);
  // true type
  tsParseType();
  expect(tt.colon);
  // false type
  tsParseType();
}

export function tsParseNonConditionalType(): void {
  if (tsIsStartOfFunctionType()) {
    tsParseFunctionOrConstructorType(FunctionType.TSFunctionType);
    return;
  }
  if (match(tt._new)) {
    // As in `new () => Date`
    tsParseFunctionOrConstructorType(FunctionType.TSConstructorType);
    return;
  }
  tsParseUnionTypeOrHigher();
}

export function tsParseTypeAssertion(): void {
  const oldIsType = pushTypeContext(1);
  tsParseType();
  expect(tt.greaterThan);
  popTypeContext(oldIsType);
  parseMaybeUnary();
}

export function tsTryParseJSXTypeArgument(): void {
  if (eat(tt.jsxTagStart)) {
    state.tokens[state.tokens.length - 1].type = tt.typeParameterStart;
    const oldIsType = pushTypeContext(1);
    while (!match(tt.greaterThan) && !state.error) {
      tsParseType();
      eat(tt.comma);
    }
    // Process >, but the one after needs to be parsed JSX-style.
    nextJSXTagToken();
    popTypeContext(oldIsType);
  }
}

function tsParseHeritageClause(): void {
  while (!match(tt.braceL) && !state.error) {
    tsParseExpressionWithTypeArguments();
    eat(tt.comma);
  }
}

function tsParseExpressionWithTypeArguments(): void {
  // Note: TS uses parseLeftHandSideExpressionOrHigher,
  // then has grammar errors later if it's not an EntityName.
  tsParseEntityName();
  if (match(tt.lessThan)) {
    tsParseTypeArguments();
  }
}

function tsParseInterfaceDeclaration(): void {
  parseIdentifier();
  tsTryParseTypeParameters();
  if (eat(tt._extends)) {
    tsParseHeritageClause();
  }
  tsParseObjectTypeMembers();
}

function tsParseTypeAliasDeclaration(): void {
  parseIdentifier();
  tsTryParseTypeParameters();
  expect(tt.eq);
  tsParseType();
  semicolon();
}

function tsParseEnumMember(): void {
  // Computed property names are grammar errors in an enum, so accept just string literal or identifier.
  if (match(tt.string)) {
    parseLiteral();
  } else {
    parseIdentifier();
  }
  if (eat(tt.eq)) {
    const eqIndex = state.tokens.length - 1;
    parseMaybeAssign();
    state.tokens[eqIndex].rhsEndIndex = state.tokens.length;
  }
}

function tsParseEnumDeclaration(): void {
  parseIdentifier();
  expect(tt.braceL);
  while (!eat(tt.braceR) && !state.error) {
    tsParseEnumMember();
    eat(tt.comma);
  }
}

function tsParseModuleBlock(): void {
  expect(tt.braceL);
  parseBlockBody(/* end */ tt.braceR);
}

function tsParseModuleOrNamespaceDeclaration(): void {
  parseIdentifier();
  if (eat(tt.dot)) {
    tsParseModuleOrNamespaceDeclaration();
  } else {
    tsParseModuleBlock();
  }
}

function tsParseAmbientExternalModuleDeclaration(): void {
  if (isContextual(ContextualKeyword._global)) {
    parseIdentifier();
  } else if (match(tt.string)) {
    parseExprAtom();
  } else {
    unexpected();
  }

  if (match(tt.braceL)) {
    tsParseModuleBlock();
  } else {
    semicolon();
  }
}

export function tsParseImportEqualsDeclaration(): void {
  parseIdentifier();
  expect(tt.eq);
  tsParseModuleReference();
  semicolon();
}

function tsIsExternalModuleReference(): boolean {
  return isContextual(ContextualKeyword._require) && lookaheadType() === tt.parenL;
}

function tsParseModuleReference(): void {
  if (tsIsExternalModuleReference()) {
    tsParseExternalModuleReference();
  } else {
    tsParseEntityName();
  }
}

function tsParseExternalModuleReference(): void {
  expectContextual(ContextualKeyword._require);
  expect(tt.parenL);
  if (!match(tt.string)) {
    unexpected();
  }
  parseLiteral();
  expect(tt.parenR);
}

// Utilities

// Returns true if a statement matched.
function tsTryParseDeclare(): boolean {
  switch (state.type) {
    case tt._function: {
      const oldIsType = pushTypeContext(1);
      next();
      // We don't need to precisely get the function start here, since it's only used to mark
      // the function as a type if it's bodiless, and it's already a type here.
      const functionStart = state.start;
      parseFunction(functionStart, /* isStatement */ true);
      popTypeContext(oldIsType);
      return true;
    }
    case tt._class: {
      const oldIsType = pushTypeContext(1);
      parseClass(/* isStatement */ true, /* optionalId */ false);
      popTypeContext(oldIsType);
      return true;
    }
    case tt._const: {
      if (match(tt._const) && isLookaheadContextual(ContextualKeyword._enum)) {
        const oldIsType = pushTypeContext(1);
        // `const enum = 0;` not allowed because "enum" is a strict mode reserved word.
        expect(tt._const);
        expectContextual(ContextualKeyword._enum);
        state.tokens[state.tokens.length - 1].type = tt._enum;
        tsParseEnumDeclaration();
        popTypeContext(oldIsType);
        return true;
      }
    }
    // falls through
    case tt._var:
    case tt._let: {
      const oldIsType = pushTypeContext(1);
      parseVarStatement(state.type);
      popTypeContext(oldIsType);
      return true;
    }
    case tt.name: {
      const oldIsType = pushTypeContext(1);
      const contextualKeyword = state.contextualKeyword;
      let matched = false;
      if (contextualKeyword === ContextualKeyword._global) {
        tsParseAmbientExternalModuleDeclaration();
        matched = true;
      } else {
        matched = tsParseDeclaration(contextualKeyword, /* isBeforeToken */ true);
      }
      popTypeContext(oldIsType);
      return matched;
    }
    default:
      return false;
  }
}

// Note: this won't be called unless the keyword is allowed in `shouldParseExportDeclaration`.
// Returns true if it matched a declaration.
function tsTryParseExportDeclaration(): boolean {
  return tsParseDeclaration(state.contextualKeyword, /* isBeforeToken */ true);
}

// Returns true if it matched a statement.
function tsParseExpressionStatement(contextualKeyword: ContextualKeyword): boolean {
  switch (contextualKeyword) {
    case ContextualKeyword._declare: {
      const declareTokenIndex = state.tokens.length - 1;
      const matched = tsTryParseDeclare();
      if (matched) {
        state.tokens[declareTokenIndex].type = tt._declare;
        return true;
      }
      break;
    }
    case ContextualKeyword._global:
      // `global { }` (with no `declare`) may appear inside an ambient module declaration.
      // Would like to use tsParseAmbientExternalModuleDeclaration here, but already ran past "global".
      if (match(tt.braceL)) {
        tsParseModuleBlock();
        return true;
      }
      break;

    default:
      return tsParseDeclaration(contextualKeyword, /* isBeforeToken */ false);
  }
  return false;
}

// Common to tsTryParseDeclare, tsTryParseExportDeclaration, and tsParseExpressionStatement.
// Returns true if it matched a declaration.
function tsParseDeclaration(contextualKeyword: ContextualKeyword, isBeforeToken: boolean): boolean {
  switch (contextualKeyword) {
    case ContextualKeyword._abstract:
      if (isBeforeToken || match(tt._class)) {
        if (isBeforeToken) next();
        state.tokens[state.tokens.length - 1].type = tt._abstract;
        parseClass(/* isStatement */ true, /* optionalId */ false);
        return true;
      }
      break;

    case ContextualKeyword._enum:
      if (isBeforeToken || match(tt.name)) {
        if (isBeforeToken) next();
        state.tokens[state.tokens.length - 1].type = tt._enum;
        tsParseEnumDeclaration();
        return true;
      }
      break;

    case ContextualKeyword._interface:
      if (isBeforeToken || match(tt.name)) {
        // `next` is true in "export" and "declare" contexts, so we want to remove that token
        // as well.
        const oldIsType = pushTypeContext(1);
        if (isBeforeToken) next();
        tsParseInterfaceDeclaration();
        popTypeContext(oldIsType);
        return true;
      }
      break;

    case ContextualKeyword._module:
      if (isBeforeToken) next();
      if (match(tt.string)) {
        const oldIsType = pushTypeContext(isBeforeToken ? 2 : 1);
        tsParseAmbientExternalModuleDeclaration();
        popTypeContext(oldIsType);
        return true;
      } else if (match(tt.name)) {
        const oldIsType = pushTypeContext(isBeforeToken ? 2 : 1);
        tsParseModuleOrNamespaceDeclaration();
        popTypeContext(oldIsType);
        return true;
      }
      break;

    case ContextualKeyword._namespace:
      if (isBeforeToken || match(tt.name)) {
        const oldIsType = pushTypeContext(1);
        if (isBeforeToken) next();
        tsParseModuleOrNamespaceDeclaration();
        popTypeContext(oldIsType);
        return true;
      }
      break;

    case ContextualKeyword._type:
      if (isBeforeToken || match(tt.name)) {
        const oldIsType = pushTypeContext(1);
        if (isBeforeToken) next();
        tsParseTypeAliasDeclaration();
        popTypeContext(oldIsType);
        return true;
      }
      break;

    default:
      break;
  }
  return false;
}

// Returns true if there was a generic async arrow function.
function tsTryParseGenericAsyncArrowFunction(): boolean {
  const snapshot = state.snapshot();

  tsParseTypeParameters();
  parseFunctionParams();
  tsTryParseTypeOrTypePredicateAnnotation();
  expect(tt.arrow);

  if (state.error) {
    state.restoreFromSnapshot(snapshot);
    return false;
  }

  // We don't need to be precise about the function start since it's only used if this is a
  // bodiless function, which isn't valid here.
  const functionStart = state.start;
  parseFunctionBody(functionStart, false /* isGenerator */, true);
  return true;
}

function tsParseTypeArguments(): void {
  const oldIsType = pushTypeContext(0);
  expect(tt.lessThan);
  while (!eat(tt.greaterThan) && !state.error) {
    tsParseType();
    eat(tt.comma);
  }
  popTypeContext(oldIsType);
}

export function tsIsDeclarationStart(): boolean {
  if (match(tt.name)) {
    switch (state.contextualKeyword) {
      case ContextualKeyword._abstract:
      case ContextualKeyword._declare:
      case ContextualKeyword._enum:
      case ContextualKeyword._interface:
      case ContextualKeyword._module:
      case ContextualKeyword._namespace:
      case ContextualKeyword._type:
        return true;
      default:
        break;
    }
  }

  return false;
}

// ======================================================
// OVERRIDES
// ======================================================

export function tsParseFunctionBodyAndFinish(
  functionStart: i32,
  isGenerator: boolean,
  allowExpressionBody: boolean,
  funcContextId: i32,
): void {
  // For arrow functions, `parseArrow` handles the return type itself.
  if (!allowExpressionBody && match(tt.colon)) {
    tsParseTypeOrTypePredicateAnnotation(tt.colon);
  }

  // The original code checked the node type to make sure this function type allows a missing
  // body, but we skip that to avoid sending around the node type. We instead just use the
  // allowExpressionBody boolean to make sure it's not an arrow function.
  if (!allowExpressionBody && !match(tt.braceL) && isLineTerminator()) {
    // Retroactively mark the function declaration as a type.
    let i = state.tokens.length - 1;
    while (
      i >= 0 &&
      (state.tokens[i].start >= functionStart ||
        state.tokens[i].type === tt._default ||
        state.tokens[i].type === tt._export)
    ) {
      state.tokens[i].isType = true;
      i--;
    }
    return;
  }

  parseFunctionBody(functionStart, isGenerator, allowExpressionBody, funcContextId);
}

export function tsParseSubscript(startPos: i32, noCalls: boolean, stopState: StopState): void {
  if (!hasPrecedingLineBreak() && eat(tt.bang)) {
    state.tokens[state.tokens.length - 1].type = tt.nonNullAssertion;
    return;
  }

  if (match(tt.lessThan)) {
    // There are number of things we are going to "maybe" parse, like type arguments on
    // tagged template expressions. If any of them fail, walk it back and continue.
    const snapshot = state.snapshot();

    if (!noCalls && atPossibleAsync()) {
      // Almost certainly this is a generic async function `async <T>() => ...
      // But it might be a call with a type argument `async<T>();`
      const asyncArrowFn = tsTryParseGenericAsyncArrowFunction();
      if (asyncArrowFn) {
        return;
      }
    }
    tsParseTypeArguments();
    if (!noCalls && eat(tt.parenL)) {
      parseCallExpressionArguments();
    } else if (match(tt.backQuote)) {
      // Tagged template with a type argument.
      parseTemplate();
    }

    if (state.error) {
      state.restoreFromSnapshot(snapshot);
    } else {
      return;
    }
  }
  baseParseSubscript(startPos, noCalls, stopState);
}

export function tsStartParseNewArguments(): void {
  if (match(tt.lessThan)) {
    // 99% certain this is `new C<T>();`. But may be `new C < T;`, which is also legal.
    const snapshot = state.snapshot();

    state.type = tt.typeParameterStart;
    tsParseTypeArguments();
    if (!match(tt.parenL)) {
      unexpected();
    }

    if (state.error) {
      state.restoreFromSnapshot(snapshot);
    }
  }
}

export function tsTryParseExport(): boolean {
  if (match(tt._import)) {
    // `export import A = B;`
    expect(tt._import);
    tsParseImportEqualsDeclaration();
    return true;
  } else if (eat(tt.eq)) {
    // `export = x;`
    parseExpression();
    semicolon();
    return true;
  } else if (eatContextual(ContextualKeyword._as)) {
    // `export as namespace A;`
    // See `parseNamespaceExportDeclaration` in TypeScript's own parser
    expectContextual(ContextualKeyword._namespace);
    parseIdentifier();
    semicolon();
    return true;
  } else {
    return false;
  }
}

export function tsTryParseExportDefaultExpression(): boolean {
  if (isContextual(ContextualKeyword._abstract) && lookaheadType() === tt._class) {
    state.type = tt._abstract;
    next(); // Skip "abstract"
    parseClass(true, true);
    return true;
  }
  if (isContextual(ContextualKeyword._interface)) {
    // Make sure "export default" are considered type tokens so the whole thing is removed.
    const oldIsType = pushTypeContext(2);
    tsParseDeclaration(ContextualKeyword._interface, true);
    popTypeContext(oldIsType);
    return true;
  }
  return false;
}

export function tsTryParseStatementContent(): boolean {
  if (state.type === tt._const) {
    const ahead = lookaheadTypeAndKeyword();
    if (ahead.type === tt.name && ahead.contextualKeyword === ContextualKeyword._enum) {
      expect(tt._const);
      expectContextual(ContextualKeyword._enum);
      state.tokens[state.tokens.length - 1].type = tt._enum;
      tsParseEnumDeclaration();
      return true;
    }
  }
  return false;
}

export function tsParseAccessModifier(): void {
  tsParseModifier([
    ContextualKeyword._public,
    ContextualKeyword._protected,
    ContextualKeyword._private,
  ]);
}

export function tsTryParseClassMemberWithIsStatic(
  isStatic: boolean,
  classContextId: i32,
): boolean {
  let isAbstract = false;
  let isReadonly = false;

  const mod = tsParseModifier([ContextualKeyword._abstract, ContextualKeyword._readonly]);
  switch (mod) {
    case ContextualKeyword._readonly:
      isReadonly = true;
      isAbstract = !!tsParseModifier([ContextualKeyword._abstract]);
      break;
    case ContextualKeyword._abstract:
      isAbstract = true;
      isReadonly = !!tsParseModifier([ContextualKeyword._readonly]);
      break;
    default:
      break;
  }

  // We no longer check for public/private/etc, but tsTryParseIndexSignature should just return
  // false in that case for valid code.
  if (!isAbstract && !isStatic) {
    const found = tsTryParseIndexSignature();
    if (found) {
      return true;
    }
  }

  if (isReadonly) {
    // Must be a property (if not an index signature).
    parseClassPropertyName(classContextId);
    parsePostMemberNameModifiers();
    parseClassProperty();
    return true;
  }
  return false;
}

// Note: The reason we do this in `parseIdentifierStatement` and not `parseStatement`
// is that e.g. `type()` is valid JS, so we must try parsing that first.
// If it's really a type, we will parse `type` as the statement, and can correct it here
// by parsing the rest.
export function tsParseIdentifierStatement(contextualKeyword: ContextualKeyword): void {
  const matched = tsParseExpressionStatement(contextualKeyword);
  if (!matched) {
    semicolon();
  }
}

export function tsParseExportDeclaration(): void {
  // "export declare" is equivalent to just "export".
  const isDeclare = eatContextual(ContextualKeyword._declare);
  if (isDeclare) {
    state.tokens[state.tokens.length - 1].type = tt._declare;
  }

  let matchedDeclaration = false;
  if (match(tt.name)) {
    if (isDeclare) {
      const oldIsType = pushTypeContext(2);
      matchedDeclaration = tsTryParseExportDeclaration();
      popTypeContext(oldIsType);
    } else {
      matchedDeclaration = tsTryParseExportDeclaration();
    }
  }
  if (!matchedDeclaration) {
    if (isDeclare) {
      const oldIsType = pushTypeContext(2);
      parseStatement(true);
      popTypeContext(oldIsType);
    } else {
      parseStatement(true);
    }
  }
}

export function tsAfterParseClassSuper(hasSuper: boolean): void {
  if (hasSuper && match(tt.lessThan)) {
    tsParseTypeArguments();
  }
  if (eatContextual(ContextualKeyword._implements)) {
    state.tokens[state.tokens.length - 1].type = tt._implements;
    const oldIsType = pushTypeContext(1);
    tsParseHeritageClause();
    popTypeContext(oldIsType);
  }
}

export function tsStartParseObjPropValue(): void {
  tsTryParseTypeParameters();
}

export function tsStartParseFunctionParams(): void {
  tsTryParseTypeParameters();
}

// `let x: number;`
export function tsAfterParseVarHead(): void {
  eat(tt.bang);
  tsTryParseTypeAnnotation();
}

// parse the return type of an async arrow function - let foo = (async (): number => {});
export function tsStartParseAsyncArrowFromCallExpression(): void {
  if (match(tt.colon)) {
    tsParseTypeAnnotation();
  }
}

// Returns true if the expression was an arrow function.
export function tsParseMaybeAssign(noIn: boolean, isWithinParens: boolean): boolean {
  // Note: When the JSX plugin is on, type assertions (`<T> x`) aren't valid syntax.
  if (isJSXEnabled) {
    return tsParseMaybeAssignWithJSX(noIn, isWithinParens);
  } else {
    return tsParseMaybeAssignWithoutJSX(noIn, isWithinParens);
  }
}

export function tsParseMaybeAssignWithJSX(noIn: boolean, isWithinParens: boolean): boolean {
  if (!match(tt.lessThan)) {
    return baseParseMaybeAssign(noIn, isWithinParens);
  }

  // Prefer to parse JSX if possible. But may be an arrow fn.
  const snapshot = state.snapshot();
  let wasArrow = baseParseMaybeAssign(noIn, isWithinParens);
  if (state.error) {
    state.restoreFromSnapshot(snapshot);
  } else {
    return wasArrow;
  }

  // Otherwise, try as type-parameterized arrow function.
  state.type = tt.typeParameterStart;
  // This is similar to TypeScript's `tryParseParenthesizedArrowFunctionExpression`.
  tsParseTypeParameters();
  wasArrow = baseParseMaybeAssign(noIn, isWithinParens);
  if (!wasArrow) {
    unexpected();
  }

  return wasArrow;
}

export function tsParseMaybeAssignWithoutJSX(noIn: boolean, isWithinParens: boolean): boolean {
  if (!match(tt.lessThan)) {
    return baseParseMaybeAssign(noIn, isWithinParens);
  }

  const snapshot = state.snapshot();
  // This is similar to TypeScript's `tryParseParenthesizedArrowFunctionExpression`.
  tsParseTypeParameters();
  const wasArrow = baseParseMaybeAssign(noIn, isWithinParens);
  if (!wasArrow) {
    unexpected();
  }
  if (state.error) {
    state.restoreFromSnapshot(snapshot);
  } else {
    return wasArrow;
  }

  // Try parsing a type cast instead of an arrow function.
  // This will start with a type assertion (via parseMaybeUnary).
  // But don't directly call `tsParseTypeAssertion` because we want to handle any binary after it.
  return baseParseMaybeAssign(noIn, isWithinParens);
}

export function tsParseArrow(): boolean {
  if (match(tt.colon)) {
    // This is different from how the TS parser does it.
    // TS uses lookahead. Babylon parses it as a parenthesized expression and converts.
    const snapshot = state.snapshot();

    tsParseTypeOrTypePredicateAnnotation(tt.colon);
    if (canInsertSemicolon()) unexpected();
    if (!match(tt.arrow)) unexpected();

    if (state.error) {
      state.restoreFromSnapshot(snapshot);
    }
  }
  return eat(tt.arrow);
}

// Allow type annotations inside of a parameter list.
export function tsParseAssignableListItemTypes(): void {
  const oldIsType = pushTypeContext(0);
  eat(tt.question);
  tsTryParseTypeAnnotation();
  popTypeContext(oldIsType);
}

export function tsParseMaybeDecoratorArguments(): void {
  if (match(tt.lessThan)) {
    tsParseTypeArguments();
  }
  baseParseMaybeDecoratorArguments();
}
