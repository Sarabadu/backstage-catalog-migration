import {
  CatalogTable,
  CatalogTableColumnsFunc,
  CatalogTableRow,
} from '@backstage/plugin-catalog';
import { OverflowTooltip, TableColumn } from '@backstage/core-components';

const createUserEmailColumn = (): TableColumn<CatalogTableRow> => ({
  title: 'User Email',
  field: 'user.profile.email',
  render: ({ entity }) => {
    const profile = entity.spec?.profile as Record<string, any> | undefined;
    return (
      <OverflowTooltip
        text={(profile?.email as string) || ''}
        placement="bottom-start"
      />
    );
  },
});


export const customColumnFunc: CatalogTableColumnsFunc = entityListContext => {
  if (entityListContext.filters.kind?.value === 'user') {
    return [
      // Render existing columns
      ...CatalogTable.defaultColumnsFunc(entityListContext).slice(0, 2),
      // Add new columns here
      createUserEmailColumn(),
    ];
  }

  return CatalogTable.defaultColumnsFunc(entityListContext);
};
