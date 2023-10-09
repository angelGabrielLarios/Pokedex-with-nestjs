/* definir una interface para que lo implemente una clase */



export interface HttAdapter {


    get<T>(url: string): Promise<T>
}