export interface Layer {
    id: string;
    name: string;
    type: 'image' | 'text' | 'shape';
    visible: boolean;
    data: any; // This will hold the Konva object
}
