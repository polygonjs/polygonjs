export declare class CoreImage {
    static overlay(img0: HTMLImageElement, img1: HTMLImageElement): Promise<HTMLImageElement>;
    static create_white_image(width: number, height: number): Promise<HTMLImageElement>;
    static make_square(src_img: HTMLImageElement): Promise<HTMLImageElement>;
    static image_to_blob(img: HTMLImageElement): Promise<Blob>;
}
