import { EntityContentLayoutProps } from "@backstage/plugin-catalog-react/alpha";

export const CustomEntityLayout = (props: EntityContentLayoutProps) => {
    return (
        <div style={{ padding: '16px' }}>   
            <h2>Custom Entity Layout</h2>
            <p>This is a custom layout for Component and System entities.</p>
            {props.cards.map((card, index) => (
                <div key={index} style={{ marginBottom: '16px' }}>
                    {card.element}
                </div>
            ))}
        </div>
    );
}