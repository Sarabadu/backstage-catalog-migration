import { Navigate, Route } from 'react-router-dom';
import { apiDocsPlugin, ApiExplorerPage } from '@backstage/plugin-api-docs';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
} from '@backstage/plugin-catalog';
import catalogPluginNFS from '@backstage/plugin-catalog/alpha';
import {
  CatalogImportPage,
  catalogImportPlugin,
} from '@backstage/plugin-catalog-import';
import { ScaffolderPage, scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { orgPlugin } from '@backstage/plugin-org';
import { SearchPage } from '@backstage/plugin-search';
import {
  TechDocsIndexPage,
  techdocsPlugin,
  TechDocsReaderPage,
} from '@backstage/plugin-techdocs';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
import { ReportIssue } from '@backstage/plugin-techdocs-module-addons-contrib';
import { UserSettingsPage } from '@backstage/plugin-user-settings';
import { apis } from './apis';
import { entityPage } from './components/catalog/EntityPage';
import { searchPage } from './components/search/SearchPage';
import { Root } from './components/Root';

import {
  AlertDisplay,
  OAuthRequestDialog,
  Page,
  SignInPage,
} from '@backstage/core-components';
import { createApp } from '@backstage/frontend-defaults';
import {
  convertLegacyAppOptions,
  convertLegacyAppRoot,
} from '@backstage/core-compat-api';
import { AppRouter, FeatureFlagged, FlatRoutes } from '@backstage/core-app-api';
import { CatalogGraphPage } from '@backstage/plugin-catalog-graph';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { NotificationsPage } from '@backstage/plugin-notifications';
import { SignalsDisplay } from '@backstage/plugin-signals';
import {
  createFrontendModule,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';
import { navModule } from './modules/nav';
import visualizerPlugin from '@backstage/plugin-app-visualizer';
import catalogGraph from '@backstage/plugin-catalog-graph/alpha';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
  EntityContentLayoutBlueprint,
  CatalogFilterBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import {
  FilterPredicate,
  createZodV3FilterPredicateSchema,
} from '@backstage/filter-predicates';

import kubernetesPlugin from '@backstage/plugin-kubernetes/alpha';
import { customColumnFunc } from './components/catalog/CustomCatalogColumn';

const routes = (
  <FlatRoutes>
    <Route path="/" element={<Navigate to="catalog" />} />
    {/* <Route path="/catalog" element={<CatalogIndexPage />} />
    <Route
      path="/catalog/:namespace/:kind/:name"
      element={<CatalogEntityPage />}
    >
      {entityPage}
    </Route> */}
    <Route path="/docs" element={<TechDocsIndexPage />} />
    <Route
      path="/docs/:namespace/:kind/:name/*"
      element={<TechDocsReaderPage />}
    >
      <TechDocsAddons>
        <ReportIssue />
      </TechDocsAddons>
    </Route>
    <Route path="/create" element={<ScaffolderPage />} />
    <Route path="/api-docs" element={<ApiExplorerPage />} />
    <Route
      path="/catalog-import"
      element={
        <RequirePermission permission={catalogEntityCreatePermission}>
          <CatalogImportPage />
        </RequirePermission>
      }
    />
    <Route path="/search" element={<SearchPage />}>
      {searchPage}
    </Route>
    <Route path="/settings" element={<UserSettingsPage />} />
    <Route path="/catalog-graph" element={<CatalogGraphPage />} />
    <Route path="/notifications" element={<NotificationsPage />} />
  </FlatRoutes>
);

const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => props =>
      <SignInPage {...props} auto providers={['guest']} />,
  },
});

// const convertedOptionsModule = convertLegacyAppOptions({
//   components: {
//     SignInPage: props => <SignInPage {...props} auto providers={['guest']} />,
//   },
// });

// const convertedRootFeatures = convertLegacyAppRoot(
//   <>
//     <AppRouter>
//       <Root>{routes}</Root>
//     </AppRouter>
//   </>,
// );
const convertedRootFeatures = convertLegacyAppRoot(routes, { entityPage });

const customCatalogFilter = CatalogFilterBlueprint.make({
  name: 'custom-catalog-filter',
  params: {
    loader: async () =>
      import('./components/catalog/CustomCatalogFilter').then(m => (
        <m.CustomCatalogFilter />
      )),
  },
});

const customEntityContent = EntityContentBlueprint.make({
  name: 'custom-content',
  params: {
    filter: entity =>
      ['Component'].includes(entity.kind) && entity.spec?.type === 'website',
    path: '/custom',
    title: 'Custom Tab',
    group: 'deployment',
    icon: 'laptop',
    loader: async () =>
      import('./components/catalog/CustomEntityContent').then(m => (
        <m.CustomEntityContent />
      )),
  },
});

const componentLayout = EntityContentLayoutBlueprint.make({
  name: 'custom-layout',
  params: {
    filter: entity => ['Component'].includes(entity.kind),
    loader: async () =>
      import('./components/catalog/CustomEntityLayout').then(
        m => m.CustomEntityLayout,
      ),
  },
});

const customEntityCardExtension = EntityCardBlueprint.makeWithOverrides({
  name: 'custom-internal-card',
  config: {
    schema: {
      title: z => z.string().optional().describe('Title for the custom card'),
    },
  },
  factory(originalFactory, { config }) {
    return originalFactory({
      filter: entity => ['Component', 'System'].includes(entity.kind),
      type: 'info',
      loader: async () =>
        import('./components/EntityCustomCard').then(m => (
          <m.EntityCustomCard title={config.title ?? 'Custom Card'} />
        )),
    });
  },
});

const customCatalogIndexPage = catalogPluginNFS
  .getExtension('page:catalog')
  .override({
    params: {
      path: '/catalog',
      loader: async () => (
        <CatalogIndexPage
          initialKind="Component"
          ownerPickerMode="all"
          columns={customColumnFunc}
          tableOptions={{ search: false }}
        />
      ),
    },
  });

const app = createApp({
  bindRoutes({ bind }) {
    bind(catalogPlugin.externalRoutes, {
      createComponent: scaffolderPlugin.routes.root,
      viewTechDoc: techdocsPlugin.routes.docRoot,
      createFromTemplate: scaffolderPlugin.routes.selectedTemplate,
    });
    bind(apiDocsPlugin.externalRoutes, {
      registerApi: catalogImportPlugin.routes.importPage,
    });
    bind(scaffolderPlugin.externalRoutes, {
      registerComponent: catalogImportPlugin.routes.importPage,
      viewTechDoc: techdocsPlugin.routes.docRoot,
    });
    bind(orgPlugin.externalRoutes, {
      catalogIndex: catalogPlugin.routes.catalogIndex,
    });
  },
  features: [
    // convertedOptionsModule,
    ...convertedRootFeatures,
    catalogPluginNFS,
    visualizerPlugin,
    catalogGraph,
    createFrontendModule({
      pluginId: 'app',
      extensions: [...apis, signInPage],
    }),
    createFrontendModule({
      pluginId: 'catalog',
      extensions: [
        customEntityCardExtension,
        customEntityContent,
        customCatalogFilter,
        customCatalogIndexPage,
      ],
    }),
    navModule,
    kubernetesPlugin,
  ],
});

export default app.createRoot();
