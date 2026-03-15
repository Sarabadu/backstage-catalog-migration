import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  configApiRef,
} from '@backstage/core-plugin-api';

import {
  ApiBlueprint,
  
  OverridableExtensionDefinition,
} from '@backstage/frontend-plugin-api';

export const scmIntegrationsApi = ApiBlueprint.make({
  name: 'scm-integrations',
  params: defineParams =>
    defineParams({
      api: scmIntegrationsApiRef,
      deps: { configApi: configApiRef },
      factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
    }),
});

export const apis: OverridableExtensionDefinition[] = [
  scmIntegrationsApi,
  // ScmAuth.createDefaultApiFactory(),
];
