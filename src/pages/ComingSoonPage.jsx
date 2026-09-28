import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import EmptyState from '../components/EmptyState'

// TEMPORARY page for sidebar links whose screens are built in later steps.
// It lets you click every menu item without landing on a 404.
export default function ComingSoonPage({ title }) {
  return (
    <>
      <PageHeader title={title} />
      <Panel title={title}>
        <EmptyState
          title="This page is not built yet"
          message="It is part of a later step of the frontend."
        />
      </Panel>
    </>
  )
}
