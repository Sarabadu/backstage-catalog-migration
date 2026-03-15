import { EmptyState } from "@backstage/core-components";

export const EntityCustomCard = (props:{title: string}) => (
  <EmptyState
    title={props.title}
    missing="info"
    description="This is an example of a custom card that you can add to the entity page. You can use any React component here, and you can also consume any of the APIs that are available in Backstage."
  />
);