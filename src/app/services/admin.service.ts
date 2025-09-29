import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: string;
  gender: string;
  status: string;
  address?: string;
  nationalId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    // you can add more fields if you want
  };
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}


// export interface AdminStats {
//   totalUsers: number;
//   activeAccounts: number;
//   totalBalance: number;
//   transactionsToday: number;
// }

export interface Account {
  id?: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  status: string;
  interestRate: number;
  customerId: number;
  customerName: string;
  createdAt: Date;
}

export interface AdminTransaction {
  id: string;
  type: 'transfer' | 'deposit' | 'withdraw';
  amount: number;
  completedAt: Date;
  description: string;
  status: string;
  fromAccountNumber?: string;
  toAccountNumber?: string;
  customerName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/admin';

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Customer management
  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<PageResponse<Customer>>(`${this.baseUrl}/customers`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response: PageResponse<Customer>) => response.content)
    );
  }

  getAllCustomersPaged(page: number = 0, size: number = 20): Observable<PageResponse<Customer>> {
    return this.http.get<PageResponse<Customer>>(`${this.baseUrl}/customers`, {
      headers: this.getAuthHeaders(),
      params: {
        page: page.toString(),
        size: size.toString()
      }
    });
  }

  getCustomerById(customerId: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.baseUrl}/customers/${customerId}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateCustomerStatus(customerId: number, status: string): Observable<Customer> {
    return this.http.put<Customer>(`${this.baseUrl}/customers/${customerId}/status`, null, {
      headers: this.getAuthHeaders(),
      params: { status }
    });
  }

  deleteCustomer(customerId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/customers/${customerId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Account management
  getAllAccounts(): Observable<Account[]> {
    return this.http.get<PageResponse<Account>>(`${this.baseUrl}/accounts`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response: PageResponse<Account>) => response.content)
    );
  }

  getAllAccountsPaged(page: number = 0, size: number = 20): Observable<PageResponse<Account>> {
    return this.http.get<PageResponse<Account>>(`${this.baseUrl}/accounts`, {
      headers: this.getAuthHeaders(),
      params: {
        page: page.toString(),
        size: size.toString()
      }
    });
  }

  updateAccountStatus(accountId: number | string, status: string): Observable<Account> {
    return this.http.put<Account>(`${this.baseUrl}/accounts/${accountId}/status`, null, {
      headers: this.getAuthHeaders(),
      params: { status }
    });
  }

  updateAccountInterestRate(accountNumber: string, interestRate: number): Observable<Account> {
    return this.http.patch<Account>(`${this.baseUrl}/accounts/${accountNumber}/interest-rate`, 
      { interestRate }, 
      { headers: this.getAuthHeaders() }
    );
  }

  deleteAccount(accountId: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/accounts/${accountId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Transaction management
  getAllTransactions(): Observable<AdminTransaction[]> {
    return this.http.get<PageResponse<AdminTransaction>>(`${this.baseUrl}/transactions`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response: PageResponse<AdminTransaction>) => response.content)
    );
  }

  getAllTransactionsPaged(page: number = 0, size: number = 20): Observable<PageResponse<AdminTransaction>> {
    return this.http.get<PageResponse<AdminTransaction>>(`${this.baseUrl}/transactions`, {
      headers: this.getAuthHeaders(),
      params: {
        page: page.toString(),
        size: size.toString()
      }
    });
  }

  getTransactionsByDateRange(startDate: string, endDate: string): Observable<AdminTransaction[]> {
    return this.http.get<PageResponse<AdminTransaction>>(`${this.baseUrl}/transactions`, {
      headers: this.getAuthHeaders(),
      params: {
        startDate,
        endDate
      }
    }).pipe(
      map((response: PageResponse<AdminTransaction>) => response.content)
    );
  }

  // Dashboard statistics
//   getAdminStats(): Observable<AdminStats> {
//     return this.http.get<AdminStats>(`${this.baseUrl}/admin/stats`, {
//       headers: this.getAuthHeaders()
//     });
//   }

  // Reports
  generateUserReport(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/admin/reports/users`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  generateTransactionReport(startDate: string, endDate: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/admin/reports/transactions`, {
      headers: this.getAuthHeaders(),
      params: { startDate, endDate },
      responseType: 'blob'
    });
  }

  // User creation (admin only)
  createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    userType: string;
    gender: string;
    password: string;
  }): Observable<Customer> {
    return this.http.post<Customer>(`${this.baseUrl}/admin/users`, userData, {
      headers: this.getAuthHeaders()
    });
  }
}