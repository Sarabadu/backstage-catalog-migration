import { useEntity } from '@backstage/plugin-catalog-react';

export const CustomEntityContent = () => {
    const { entity } = useEntity();

    return (
        <div >
            <h1>{entity.metadata.name}</h1>
            <p>This is a custom content component for the {entity.kind} entity.</p>
        </div>
    );
}
