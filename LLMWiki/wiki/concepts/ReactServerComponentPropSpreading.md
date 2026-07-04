# React Server Component Prop Spreading

When working with Next.js App Router and React Server Components (RSC), complex layouts often require deep prop spreading to pass styles, state, and rendering logic down to deeply nested child components.

## The `className` Override Bug
A common issue when spreading props is unintentional overriding of base styles (`className` logic bugs).
If a child component like `LiveTimingTower` accepts a `className` prop from its parent, you must use a utility like `twMerge` or `clsx` from the [[Stitch_Design_System]] to properly merge the parent's `className` with the base styles of the child. 

If you simply use string interpolation (`className={\`base-styles \${props.className}\`}`), the tailwind classes might clash and fail to render correctly in presets like `F1PresetStatsDetailed` and `F1PresetCompactOverview`.

## Best Practices
- Always merge classnames dynamically using a utility when accepting a `className` prop.
- Ensure that the RSC boundary (where server components pass data to client components) does not try to spread non-serializable props (like functions or complex class instances).
