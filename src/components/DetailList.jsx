import './DetailList.css'

// Label + value pairs in a grid.
//   items:    [{ label, value }]
//   columns:  2 (default) or 3; always one column on phones
export default function DetailList({ items, columns = 2 }) {
  return (
    <dl className={`detail-list${columns === 3 ? ' detail-list--three' : ''}`}>
      {items.map(({ label, value }) => (
        <div className="detail-list__item" key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
