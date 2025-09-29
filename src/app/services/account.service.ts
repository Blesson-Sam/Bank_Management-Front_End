import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Account {
  accountNumber: string;
  accountType: string;
  balance: number;
  status: string;
  interestRate: number;
}

export interface Transaction {
  id: string;
  type: 'transfer' | 'deposit' | 'withdraw';
  amount: number;
  date: Date;
  description: string;
  status: string;
  fromAccount?: string;
  toAccount?: string;
}

export interface TransferRequest {
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
  description?: string;
}

export interface DepositRequest {
  accountNumber: string;
  amount: number;
  description?: string;
}

export interface WithdrawRequest {
  accountNumber: string;
  amount: number;
  description?: string;
}

export interface CreateAccountRequest {
  accountType: string;
  initialDeposit?: number;
}

export interface UpdateAccountStatusRequest {
  status: string;
}

export interface UpdateInterestRateRequest {
  interestRate: number;
}

export interface CustomerProfile {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  nationalId?: string;
  status?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  nationalId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1';

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    console.log('AccountService: Retrieved auth token', token);
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Account operations
  getUserAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/my-accounts`, {
      headers: this.getAuthHeaders()
    });
  }

  createAccount(request: CreateAccountRequest): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/accounts`, request, {
      headers: this.getAuthHeaders()
    });
  }

  updateAccountStatus(accountNumber: string, request: UpdateAccountStatusRequest): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/accounts/${accountNumber}/status`, request, {
      headers: this.getAuthHeaders()
    });
  }

  updateInterestRate(accountNumber: string, request: UpdateInterestRateRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/accounts/${accountNumber}/interest`, request, {
      headers: this.getAuthHeaders()
    });
  }

  // Transaction operations
  getRecentTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions/my-transactions`, {
      headers: this.getAuthHeaders()
    });
  }

  getAllTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions`, {
      headers: this.getAuthHeaders()
    });
  }

  // Get transactions for a specific account for the current month
// Helper function to format date as "YYYY-MM-DD HH:mm:ss"
private formatDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Get transactions for a specific account for the current month
getAccountTransactionsThisMonth(accountNumber: string): Observable<Transaction[]> {
  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const url = `${this.baseUrl}/transactions/account/${accountNumber}/date-range`;

  // Pass as plain strings
  const params = {
    startDate: this.formatDateTime(startOfMonth),
    endDate: this.formatDateTime(endOfMonth)
  };

  return this.http.get<Transaction[]>(url, {
    headers: this.getAuthHeaders(),
    params: params as any // important: prevent Angular from converting Date to ISO
  });
}



  // Helper to format month with leading zero
private pad(n: number): string {
  return n.toString().padStart(2, '0'); 
}

// Get transactions for a specific account with dynamic month/year
getAccountTransactionsMonthly(accountNumber: string, year?: number, month?: number): Observable<Transaction[]> {
  const now = new Date();
  year = year ?? now.getFullYear();           // default to current year
  month = month ?? (now.getMonth() + 1);

  // Calculate the last day of the month
  const lastDayOfMonth = new Date(year, month, 0).getDate();

  const startDate = `${year}-${this.pad(month)}-01 00:00:00`;
  const endDate = `${year}-${this.pad(month)}-${this.pad(lastDayOfMonth)} 23:59:59`;

  console.log('=== Account Service Monthly Transactions ===');
  console.log('Account Number:', accountNumber);
  console.log('Year:', year);
  console.log('Month:', month);
  console.log('Start Date:', startDate);
  console.log('End Date:', endDate);

  const url = `${this.baseUrl}/transactions/account/${accountNumber}/date-range`;
  
  const params = {
    startDate: startDate,
    endDate: endDate
  };

  console.log('API URL:', url);
  console.log('Parameters:', params);
  console.log('=============================================');

  return this.http.get<Transaction[]>(url, {
    headers: this.getAuthHeaders(),
    params: params
  });
}

// Alias method for backward compatibility with dashboard
getAccountTransactionsByMonth(accountNumber: string, year: number, month: number): Observable<Transaction[]> {
  return this.getAccountTransactionsMonthly(accountNumber, year, month);
}

  transferFunds(request: TransferRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.baseUrl}/transactions/transfer`, request, {
      headers: this.getAuthHeaders()
    });
  }

  depositMoney(request: DepositRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.baseUrl}/transactions/deposit`, request, {
      headers: this.getAuthHeaders()
    });
  }

  withdrawMoney(request: WithdrawRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.baseUrl}/transactions/withdraw`, request, {
      headers: this.getAuthHeaders()
    });
  }

  // Profile operations
  getCurrentUserProfile(): Observable<CustomerProfile> {
    const url = `${this.baseUrl}/customers/profile`;
    const headers = this.getAuthHeaders();
    console.log('AccountService: Making GET request to:', url);
    console.log('AccountService: Request headers:', headers);
    console.log('AccountService: Base URL:', this.baseUrl);
    
    return this.http.get<CustomerProfile>(url, {
      headers: headers
    });
  }

  // Alternative method if backend expects customer ID in URL
  getUserProfileById(customerId: number): Observable<CustomerProfile> {
    const url = `${this.baseUrl}/customers/${customerId}`;
    const headers = this.getAuthHeaders();
    console.log('AccountService: Making GET request to:', url);
    console.log('AccountService: Request headers:', headers);
    
    return this.http.get<CustomerProfile>(url, {
      headers: headers
    });
  }

  updateUserProfile(customerId: number, profile: UpdateProfileRequest): Observable<CustomerProfile> {
    return this.http.put<CustomerProfile>(`${this.baseUrl}/customers/${customerId}`, profile, {
      headers: this.getAuthHeaders()
    });
  }

  // Admin operations (if needed)
  getAllAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/admin/accounts`, {
      headers: this.getAuthHeaders()
    });
  }

  getAllTransactionsForAdmin(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/admin/transactions`, {
      headers: this.getAuthHeaders()
    });
  }
}