export default function Logo() {
    return (
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-md" style={{background: 'linear-gradient(90deg, var(--brand-from), var(--brand-to))'}} />
        <span className="font-semibold">Featurepool</span>
      </div>
    )
  }
  