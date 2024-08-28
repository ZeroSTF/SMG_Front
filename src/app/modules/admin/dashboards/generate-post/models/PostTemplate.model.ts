export interface PostTemplate {
    background: string;
    products: {
        x: number;
        y: number;
        width: number;
        height: number;
        style: 'vertical' | 'horizontal';
    };
    logoPosition: { x: number; y: number; width: number; height: number };
    title: {
        x: number;
        y: number;
        maxWidth: number;
        maxHeight: number;
        font: string;
        color: string;
    };
}
