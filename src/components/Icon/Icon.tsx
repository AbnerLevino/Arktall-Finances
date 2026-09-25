import { icons, type IconName } from './icons'

export type { IconName }

type IconProps = {
  name: IconName
  size?: number
  className?: string
}

/**
 * Renderiza um ícone SVG do catálogo. A cor vem de `currentColor`,
 * então basta definir `color` no CSS do elemento pai.
 */
export function Icon({ name, size = 24, className }: IconProps) {
  const { viewBox, path } = icons[name]

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={path} />
    </svg>
  )
}
