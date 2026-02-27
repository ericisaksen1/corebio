import type { CSSProperties } from "react"

export interface ComponentColorProps {
  bgColor?: string
  headlineColor?: string
  textColor?: string
  buttonColor?: string
  buttonHoverColor?: string
  linkColor?: string
  linkHoverColor?: string
}

export function sectionColorStyle(colors: ComponentColorProps): CSSProperties | undefined {
  const style: Record<string, string> = {}
  if (colors.bgColor) style.backgroundColor = colors.bgColor
  if (colors.buttonColor) {
    style["--color-button-bg"] = colors.buttonColor
    style["--color-button-border"] = colors.buttonColor
    style["--color-product-btn-bg"] = colors.buttonColor
    style["--color-product-btn-border"] = colors.buttonColor
  }
  if (colors.buttonHoverColor) {
    style["--color-button-hover-bg"] = colors.buttonHoverColor
    style["--color-product-btn-hover-bg"] = colors.buttonHoverColor
  }
  return Object.keys(style).length > 0 ? (style as CSSProperties) : undefined
}

export function headlineColorStyle(color?: string): CSSProperties | undefined {
  return color ? { color } : undefined
}

export function textColorStyle(color?: string): CSSProperties | undefined {
  return color ? { color } : undefined
}

export function linkColorProps(
  linkColor?: string,
  linkHoverColor?: string,
): Record<string, any> {
  const result: Record<string, any> = {}
  const style: Record<string, string> = {}

  if (linkColor) {
    style.color = linkColor
    style.borderColor = linkColor
  }
  if (linkHoverColor) {
    style["--link-hover-color"] = linkHoverColor
    result["data-link-hover"] = ""
  }

  if (Object.keys(style).length > 0) result.style = style
  return result
}
