/**
 * Render a text template that supports replacing variables with dynamic values.
 * @param template Template that uses braces to interpolate variables. Variables
 * are demarcated by `{` and `}`. Backslash can be used to escape characters.
 * @param context An object mapping variable names to values.
 */
export function renderTextTemplate(template: string, context: { [key: string]: string | undefined }): string {
  const enum ParseContext {
    LITERAL,
    VARIABLE
  }

  const enum Char {
    ESCAPE = "\\",
    VARIABLE_START = "{",
    VARIABLE_END = "}"
  }

  let parseContext = ParseContext.LITERAL;
  let escape = false;
  let result = "";
  let variableName = "";

  for (const char of template) {
    switch (parseContext) {
      case ParseContext.LITERAL: {
        if (escape) {
          result += char;
          escape = false;
        } else if (Char.ESCAPE === char) {
          escape = true;
        } else if (Char.VARIABLE_START === char) {
          parseContext = ParseContext.VARIABLE;
        } else {
          result += char;
        }
        break;
      }
      case ParseContext.VARIABLE: {
        if (escape) {
          variableName += char;
          escape = false;
        } else if (Char.ESCAPE === char) {
          escape = true;
        } else if (Char.VARIABLE_END === char) {
          const value = context[variableName];
          if (value !== undefined) {
            result += value;
          }
          variableName = "";
          parseContext = ParseContext.LITERAL;
        } else {
          variableName += char;
        }
        break;
      }
      default: {
        if (process.env.NODE_ENV !== "production") {
          const exhausted: never = parseContext;
          exhausted;
        }
      }
    }
  }

  if (variableName !== "") {
    result += Char.VARIABLE_START;
    result += variableName;
  }

  return result;
}
