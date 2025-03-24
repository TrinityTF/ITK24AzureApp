// src/components/ui/card.jsx
export function Card({ children, className, ...props }) {
  return (
    <div className={`rounded-2xl shadow-md p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}
