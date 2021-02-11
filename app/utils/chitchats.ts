import fetch from 'isomorphic-fetch';
import { config } from 'dotenv';
import { sweden } from './data/sample-addresses';
import { Shipment, CreateShipmentInput } from '../../app/interfaces/chitchat';

config();
const baseURL =
  process.env.NODE_ENV === 'production'
    ? 'https://chitchats.com/api/v1'
    : 'https://staging.chitchats.com/api/v1';

interface RequestOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH';
  clientId?: string;
  limit?: number;
  page?: number;
  json?: boolean;
  data?: {
    [key: string]: any;
  };
  params?: string;
}

function handleError(err: Error) {
  throw new Error(err.message);
}

export type ErrorMessage = {
  data?: {
    error?: {
      message: string;
    };
  };
};

export type ChitChatResponse<Data> = {
  data?: Data;
  headers: Headers;
};

export type ShipmentResponse = {
  shipment: Shipment;
};

export type SnipCartBatch = {
  id: number;
  status:	"ready" | "pending" | "received";
  created_at: string;
  label_png_url: string;
  label_zpl_url: string;
};

export async function request<T>({
  endpoint,
  method = 'GET',
  clientId = process.env.CHITCHATS_CLIENT_ID || '',
  limit = 100,
  page = 1,
  json = true,
  data = {},
  params = '',
}: RequestOptions): Promise<ChitChatResponse<T>> {
  if (!clientId) {
    throw new Error('No Client ID Provided.');
  }
  const url = `${baseURL}/clients/${clientId}/${endpoint}${params}`;
  console.log(
    `Fetching ${url} via a ${method} request with data ${data}`
  );

  const response: Response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json;',
      Authorization: process.env.CHITCHATS_API_KEY || '',
    },
    body: method === 'GET' ? undefined : data,
    method,
  }).catch(err => {
    console.log('----------');
    console.log(err)
    console.log('----------');
  });
  if (response.status >= 400 && response.status <= 500) {
    console.log(`Error! ${response.status} ${response.statusText} when trying to hit ${response.url}`);
    const { error } = await response.json();
    throw new Error('SHIT YA SHIT');
  }

  // if (response.status >= 400 && response.status <= 500) {
  //   const res = (await response.json()) as T;
  //   throw new Error(res?.data?.message);
  // }
  // console.dir(response.status, { depth: null });
  let res;
  if (json) res = (await response.json()) as T;
  return { data: res, headers: response.headers };
  // if (json) {
  // }
  // // otherwise return headers
  // return { headers: response.headers };
}

interface ShipmentArgs {
  params?: string
}

export async function getShipments({ params }: ShipmentArgs = {}): Promise<ChitChatResponse<Shipment[]>> {
  const shipments = await request<Shipment[]>({
    endpoint: 'shipments',
    params
  });
  return shipments;
}

export async function getShipment(
  id: string
): Promise<ChitChatResponse<Shipment>> {
  const shipment = await request<Shipment>({
    endpoint: `shipments/${id}`,
  });
  return shipment;
}

// // TODO: This just returns 200OK, need to modify request()
// export async function refundShipment(id: string): Promise<Shipment> {
//   const shipment = await request<Shipment>({
//     endpoint: `shipments/${id}/refund`,
//     method: 'PATCH',
//   });
//   console.log(shipment);
//   return shipment;
// }

export async function createShipment(
  data: CreateShipmentInput
): Promise<ChitChatResponse<ShipmentResponse>> {
  const shipment = await request<ShipmentResponse>({
    endpoint: 'shipments',
    method: 'POST',
    data,
    json: true,
  });
  // console.dir(shipment, { depth: null });
  return shipment;
}

export async function buyShipment(
  id: string,
  postage_type: string
): Promise<ChitChatResponse<ShipmentResponse>> {
  const shipment = await request<ShipmentResponse>({
    endpoint: `shipments/${id}/buy`,
    method: 'PATCH',
    data: {
      postage_type,
    },
    json: false,
  });
  return shipment;
}

export async function getBatches(): Promise<ChitChatResponse<SnipCartBatch[]>> {
  const batches = await request<SnipCartBatch[]>({
    endpoint: `batches`,
    method: 'GET',
    json: true,
  });
  return batches;
}

export async function getBatch(id: number): Promise<ChitChatResponse<SnipCartBatch>> {
  const batches = await request<SnipCartBatch[]>({
    endpoint: `batches/${id.toString()}`,
    method: 'GET',
    json: true,
  });
  return batches;
}

export async function createBatch(): Promise<ChitChatResponse<SnipCartBatch[]>> {
  const batch = await request<SnipCartBatch[]>({
    endpoint: `batches`,
    method: 'POST',
    json: false,
  });
  return batch;
}

interface BatchRequest {
  batchId: string;
  shipmentIds: string[];
}
export async function addToBatch(data: BatchRequest): Promise<ChitChatResponse<null>> {
  console.log(data);
  const batch = await request<null>({
    endpoint: `shipments/add_to_batch`,
    method: 'PATCH',
    json: false,
    data
  });
  return batch;
}
