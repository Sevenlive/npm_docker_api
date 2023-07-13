import axios, { AxiosResponse } from 'axios';


export function sleep (ms : number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  export const axiosPOST = async (url: string, data: any, headers: any = null): Promise<any> => {
    const res: AxiosResponse<any> = await axios.post(url, data, {
      headers: headers,
    });
    return res.data;
  };
  

  export const axiosGET = async (url: string, headers: any = null): Promise<any> => {
    const res: AxiosResponse<any> = await axios.get(url, {
        headers: headers
    });
    return res.data;
  };

  
  export const axiosPUT = async (url: string,  data: any, headers: any = null): Promise<any> => {
    const res: AxiosResponse<any> = await axios.put(url, data, {
        headers: headers
    });
    return res.data;
  };


  export function convertMsToSeconds(ms: number): number {
    return ms / 1000;
}

export function containsWordinArray(arr: string[], word: string): string | null {
  for (let i = 0; i < arr.length; i++) {
      if (arr[i].includes(word)) {
          return arr[i].replace(`${word}=`, "");
      }
  }
  return null;
}
