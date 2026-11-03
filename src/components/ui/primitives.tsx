import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu'
import * as SliderPrimitive from '@radix-ui/react-slider'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva('ui-btn', {
  variants: {
    variant: {
      default: '',
      primary: 'primary',
      danger: 'danger'
    }
  },
  defaultVariants: { variant: 'default' }
})

export interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, asChild, type = 'button', ...props },
  ref
) {
  const Comp = asChild ? Slot : 'button'
  return <Comp ref={ref} type={asChild ? undefined : type} className={cn(buttonVariants({ variant }), className)} {...props} />
})

export const Input = forwardRef<HTMLInputElement, ComponentProps<'input'>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn('num', className)} {...props} />
})

export function Slider(props: ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root className="studio-slider relative flex h-4 w-full touch-none items-center" {...props}>
      <SliderPrimitive.Track className="studio-slider-track relative h-1 grow rounded-full">
        <SliderPrimitive.Range className="studio-slider-range absolute h-full rounded-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="studio-slider-thumb block size-4 rounded-full" />
    </SliderPrimitive.Root>
  )
}

export function Switch(props: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className="studio-switch relative h-5 w-9 rounded-full border"
      {...props}
    >
      <SwitchPrimitive.Thumb className="studio-switch-thumb block size-3.5 translate-x-0.5 rounded-full transition-transform data-[state=checked]:translate-x-[18px]" />
    </SwitchPrimitive.Root>
  )
}

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <TooltipPrimitive.Provider delayDuration={400}>{children}</TooltipPrimitive.Provider>
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content className="shell-tooltip" sideOffset={6}>
          {label}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

export const Tabs = TabsPrimitive.Root
export const TabsList = TabsPrimitive.List
export const TabsTrigger = TabsPrimitive.Trigger
export const TabsContent = TabsPrimitive.Content

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

function isShellMenu(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('[role="menu"], [data-radix-popper-content-wrapper]'))
}

export function DialogContent({ title, children, narrow = false }: { title: string; children: ReactNode; narrow?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="modal-back" />
      <DialogPrimitive.Content
        className={cn('modal', narrow && 'narrow')}
        aria-describedby={undefined}
        onPointerDownOutside={(event) => {
          if (isShellMenu(event.target)) event.preventDefault()
        }}
        onFocusOutside={(event) => {
          if (isShellMenu(event.target)) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          if (isShellMenu(event.target)) event.preventDefault()
        }}
      >
        <DialogPrimitive.Title asChild>
          <h2>{title}</h2>
        </DialogPrimitive.Title>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export const DropdownMenu = DropdownPrimitive.Root
export const DropdownTrigger = DropdownPrimitive.Trigger
export const DropdownContent = forwardRef<HTMLDivElement, ComponentProps<typeof DropdownPrimitive.Content>>(function DropdownContent({ className, ...props }, ref) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content ref={ref} className={cn('shell-menu z-50 min-w-56 border p-1 shadow-xl', className)} sideOffset={6} {...props} />
    </DropdownPrimitive.Portal>
  )
})
export const DropdownItem = forwardRef<HTMLDivElement, ComponentProps<typeof DropdownPrimitive.Item>>(function DropdownItem({ className, ...props }, ref) {
  return <DropdownPrimitive.Item ref={ref} className={cn('cursor-pointer whitespace-nowrap px-2 py-1.5 outline-none', className)} {...props} />
})

export const DropdownSeparator = forwardRef<HTMLDivElement, ComponentProps<typeof DropdownPrimitive.Separator>>(function DropdownSeparator({ className, ...props }, ref) {
  return <DropdownPrimitive.Separator ref={ref} className={cn('shell-menu-separator', className)} {...props} />
})

export function StudioSelect<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  testId
}: {
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
  ariaLabel: string
  testId?: string
}) {
  const current = options.find((item) => item.value === value)
  return (
    <DropdownMenu modal={false}>
      <DropdownTrigger asChild>
        <button type="button" className="studio-select" aria-label={ariaLabel} data-testid={testId}>
          <span>{current?.label ?? value}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </DropdownTrigger>
      <DropdownContent className="studio-select-menu" align="start">
        {options.map((item) => (
          <DropdownItem
            key={item.value}
            className={item.value === value ? 'studio-option is-active' : 'studio-option'}
            data-value={item.value}
            onSelect={() => onChange(item.value)}
          >
            {item.label}
          </DropdownItem>
        ))}
      </DropdownContent>
    </DropdownMenu>
  )
}
