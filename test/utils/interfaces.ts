export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export interface ProductResponse {
  id: string;
  descricao: string;
  valorVenda: string | number;
  estoque: number;
}

export interface ClientResponse {
  id: string;
  razaoSocial: string;
  cnpj: string;
  email: string;
}

export interface OrderResponse {
  id: string;
  total: number | string;
  clientId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number | string;
  }>;
}
