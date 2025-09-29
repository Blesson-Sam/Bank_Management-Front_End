import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminService, Customer, Account, AdminTransaction } from '../../services/admin.service';
import { Subject, takeUntil, catchError, of } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  private destroy$ = new Subject<void>();

  // Admin dashboard state
  activeSection = signal('overview');
  
  // User info from auth service
  currentUser = this.authService.currentUser;

  // Admin data
  customers = signal<Customer[]>([]);
  allAccounts = signal<Account[]>([]);
  allTransactions = signal<AdminTransaction[]>([]);
  
  // Loading states
  isLoadingCustomers = signal(false);
  isLoadingAccounts = signal(false);
  isLoadingTransactions = signal(false);

  // Error states
  customersError = signal<string | null>(null);
  accountsError = signal<string | null>(null);
  transactionsError = signal<string | null>(null);

  // Transaction filtering
  transactionFilter = signal<string>('all');
  
  // Modal states - Customer
  showStatusModal = signal(false);
  selectedCustomer = signal<Customer | null>(null);
  selectedStatus = signal<string>('');
  isUpdatingStatus = signal(false);
  
  // Modal states - Account
  showAccountStatusModal = signal(false);
  selectedAccount = signal<Account | null>(null);
  selectedAccountStatus = signal<string>('');
  isUpdatingAccountStatus = signal(false);
  
  // Modal states - Delete Account
  showDeleteAccountModal = signal(false);
  selectedAccountForDelete = signal<Account | null>(null);
  isDeletingAccount = signal(false);
  
  // Modal states - Delete Customer
  showDeleteCustomerModal = signal(false);
  selectedCustomerForDelete = signal<Customer | null>(null);
  isDeletingCustomer = signal(false);
  
  // Computed filtered transactions
  filteredTransactions = computed(() => {
    const filter = this.transactionFilter();
    const transactions = this.allTransactions();
    
    if (filter === 'all') {
      return transactions;
    }
    console.log('Filtering transactions by type:', filter);
    return transactions.filter(transaction => transaction.type.toLocaleLowerCase() === filter);
  });

  ngOnInit() {
    this.loadOverviewData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setActiveSection(section: string) {
    this.activeSection.set(section);
    
    // Load data based on active section
    switch (section) {
      case 'users':
        this.loadCustomers();
        break;
      case 'accounts':
        this.loadAccounts();
        break;
      case 'transactions':
        this.loadTransactions();
        break;
      case 'overview':
        this.loadOverviewData();
        break;
    }
  }

  loadOverviewData() {
    console.log('Loading overview data...');
    // Load all three datasets for the overview
    this.loadCustomersForOverview();
    this.loadAccountsForOverview();
    this.loadTransactionsForOverview();
  }

  loadCustomersForOverview() {
    this.isLoadingCustomers.set(true);
    this.customersError.set(null);

    // Check if we have an auth token
    const token = localStorage.getItem('authToken');
    console.log('Auth token available:', !!token);

    this.adminService.getAllCustomers()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading customers:', error);
          let errorMessage = 'Failed to load customers data';
          
          if (error.status === 0) {
            errorMessage = 'Backend server not running on localhost:8080';
          } else if (error.status === 404) {
            errorMessage = 'Customers endpoint not found. Please implement GET /api/admin/customers';
          } else if (error.status === 401 || error.status === 403) {
            errorMessage = 'Access denied. Please check admin permissions.';
          }
          
          this.customersError.set(errorMessage);
          
          // For development: return mock data so UI can be tested
          const mockCustomers = [
            { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@test.com', phone: '123-456-7890', userType: 'customer', gender: 'male', status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com', phone: '098-765-4321', userType: 'customer', gender: 'female', status: 'active', createdAt: new Date(), updatedAt: new Date() }
          ];
          return of(mockCustomers);
        })
      )
      .subscribe(customers => {
        console.log('Customers loaded:', customers);
        this.customers.set(customers);
        this.isLoadingCustomers.set(false);
      });

  }

  loadAccountsForOverview() {
    this.isLoadingAccounts.set(true);
    this.accountsError.set(null);

    this.adminService.getAllAccounts()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading accounts:', error);
          let errorMessage = 'Failed to load accounts data';
          
          if (error.status === 0) {
            errorMessage = 'Backend server not running on localhost:8080';
          } else if (error.status === 404) {
            errorMessage = 'Accounts endpoint not found. Please implement GET /api/admin/accounts';
          } else if (error.status === 401 || error.status === 403) {
            errorMessage = 'Access denied. Please check admin permissions.';
          }
          
          this.accountsError.set(errorMessage);
          
          // For development: return mock data so UI can be tested
          const mockAccounts = [
            { accountNumber: 'ACC001', accountType: 'SAVINGS', balance: 5000, status: 'ACTIVE', interestRate: 2.5, customerId: 1, customerName: 'John Doe', createdAt: new Date() },
            { accountNumber: 'ACC002', accountType: 'CHECKING', balance: 3000, status: 'ACTIVE', interestRate: 1.0, customerId: 2, customerName: 'Jane Smith', createdAt: new Date() },
            { accountNumber: 'ACC003', accountType: 'SAVINGS', balance: 7500, status: 'ACTIVE', interestRate: 2.5, customerId: 1, customerName: 'John Doe', createdAt: new Date() }
          ];
          return of(mockAccounts);
        })
      )
      .subscribe(accounts => {
        console.log('Accounts loaded:', accounts);
        this.allAccounts.set(accounts);
        this.isLoadingAccounts.set(false);
      });
  }

  loadTransactionsForOverview() {
    this.isLoadingTransactions.set(true);
    this.transactionsError.set(null);

    this.adminService.getAllTransactions()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading transactions:', error);
          let errorMessage = 'Failed to load transactions data';
          
          if (error.status === 0) {
            errorMessage = 'Backend server not running on localhost:8080';
          } else if (error.status === 404) {
            errorMessage = 'Transactions endpoint not found. Please implement GET /api/admin/transactions';
          } else if (error.status === 401 || error.status === 403) {
            errorMessage = 'Access denied. Please check admin permissions.';
          }
          
          this.transactionsError.set(errorMessage);
          
          // For development: return mock data so UI can be tested
          const mockTransactions = [
            { id: 'TXN001', type: 'deposit' as const, amount: 1000, completedAt: new Date(), description: 'Initial deposit', status: 'completed', fromAccountNumber: 'EXT001', toAccountNumber: 'ACC001', customerName: 'John Doe' },
            { id: 'TXN002', type: 'transfer' as const, amount: 500, completedAt: new Date(), description: 'Transfer to savings', status: 'completed', fromAccountNumber: 'ACC001', toAccountNumber: 'ACC003', customerName: 'John Doe' },
            { id: 'TXN003', type: 'withdraw' as const, amount: 200, completedAt: new Date(), description: 'ATM withdrawal', status: 'completed', fromAccountNumber: 'ACC002', customerName: 'Jane Smith' },
            { id: 'TXN004', type: 'deposit' as const, amount: 2000, completedAt: new Date(), description: 'Salary deposit', status: 'completed', toAccountNumber: 'ACC002', customerName: 'Jane Smith' }
          ];
          return of(mockTransactions);
        })
      )
      .subscribe(transactions => {
        console.log('Transactions loaded:', transactions);
        this.allTransactions.set(transactions);
        this.isLoadingTransactions.set(false);
      });
  }

  loadCustomers() {
    if (this.customers().length > 0) return; // Don't reload if already loaded
    this.loadCustomersForOverview();
  }

  loadAccounts() {
    if (this.allAccounts().length > 0) return; // Don't reload if already loaded
    this.loadAccountsForOverview();
  }

  loadTransactions() {
    if (this.allTransactions().length > 0) return; // Don't reload if already loaded
    this.loadTransactionsForOverview();
  }

  // Admin actions



  // Transaction filtering methods
  onTransactionFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.transactionFilter.set(select.value);
  }

  // Utility methods
  getActiveAccountsCount(): number {
    return this.allAccounts().filter(acc => acc.status === 'ACTIVE').length;
  }

  getTotalBalance(): number {
    return this.allAccounts().reduce((sum, acc) => {
      // Ensure balance is a number (convert from string if needed)
      const balance = typeof acc.balance === 'string' ? parseFloat(acc.balance) : acc.balance;
      return sum + (isNaN(balance) ? 0 : balance);
    }, 0);
  }

  getTodaysTransactions(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.allTransactions().filter(transaction => {
      const transactionDate = new Date(transaction.completedAt);
      transactionDate.setHours(0, 0, 0, 0);
      return transactionDate.getTime() === today.getTime();
    }).length;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Modal methods
  openStatusModal(customer: Customer) {
    this.selectedCustomer.set(customer);
    this.selectedStatus.set(customer.status);
    this.showStatusModal.set(true);
  }

  closeStatusModal() {
    this.showStatusModal.set(false);
    this.selectedCustomer.set(null);
    this.selectedStatus.set('');
    this.isUpdatingStatus.set(false);
  }

  onStatusChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus.set(select.value);
  }

  updateCustomerStatus() {
    const customer = this.selectedCustomer();
    const newStatus = this.selectedStatus();
    
    if (!customer || !newStatus) return;
    
    this.isUpdatingStatus.set(true);
    
    this.adminService.updateCustomerStatus(customer.id, newStatus)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error updating customer status:', error);
          alert('Failed to update customer status. Please try again.');
          return of(null);
        })
      )
      .subscribe(updatedCustomer => {
        this.isUpdatingStatus.set(false);
        
        if (updatedCustomer) {
          // Update the customer in the list
          const customers = this.customers();
          const index = customers.findIndex(c => c.id === customer.id);
          if (index !== -1) {
            customers[index] = updatedCustomer;
            this.customers.set([...customers]);
          }
          
          this.closeStatusModal();
          alert('Customer status updated successfully!');
        }
      });
  }

  // Delete Customer Modal methods
  openDeleteCustomerModal(customer: Customer) {
    this.selectedCustomerForDelete.set(customer);
    this.showDeleteCustomerModal.set(true);
  }

  closeDeleteCustomerModal() {
    this.showDeleteCustomerModal.set(false);
    this.selectedCustomerForDelete.set(null);
    this.isDeletingCustomer.set(false);
  }

  confirmDeleteCustomer() {
    const customer = this.selectedCustomerForDelete();
    if (!customer) return;

    this.isDeletingCustomer.set(true);

    this.adminService.deleteCustomer(customer.id)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error deleting customer:', error);
          alert('Failed to delete customer. Please try again.\n\nNote: Customer may have active accounts or dependencies.');
          return of(null);
        })
      )
      .subscribe(result => {
        this.isDeletingCustomer.set(false);
        
        if (result !== null) {
          // Remove the customer from the list
          const customers = this.customers().filter(c => c.id !== customer.id);
          this.customers.set(customers);
          
          this.closeDeleteCustomerModal();
          alert('Customer deleted successfully!');
        }
      });
  }

  // Account Modal methods
  openAccountStatusModal(account: Account) {
    this.selectedAccount.set(account);
    this.selectedAccountStatus.set(account.status);
    this.showAccountStatusModal.set(true);
  }

  closeAccountStatusModal() {
    this.showAccountStatusModal.set(false);
    this.selectedAccount.set(null);
    this.selectedAccountStatus.set('');
    this.isUpdatingAccountStatus.set(false);
  }

  onAccountStatusChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedAccountStatus.set(select.value);
  }

  updateAccountStatus() {
    const account = this.selectedAccount();
    const newStatus = this.selectedAccountStatus();
    
    if (!account || !newStatus) return;
    
    this.isUpdatingAccountStatus.set(true);
    
    const accountIdentifier = account.id || account.accountNumber;
    this.adminService.updateAccountStatus(accountIdentifier, newStatus)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error updating account status:', error);
          alert('Failed to update account status. Please try again.');
          return of(null);
        })
      )
      .subscribe(updatedAccount => {
        this.isUpdatingAccountStatus.set(false);
        
        if (updatedAccount) {
          // Update the account in the list
          const accounts = this.allAccounts();
          const index = accounts.findIndex(acc => 
            (account.id && acc.id === account.id) || acc.accountNumber === account.accountNumber
          );
          if (index !== -1) {
            accounts[index] = updatedAccount;
            this.allAccounts.set([...accounts]);
          }
          
          this.closeAccountStatusModal();
          alert('Account status updated successfully!');
        }
      });
  }

  // Delete Account Modal methods
  openDeleteAccountModal(account: Account) {
    this.selectedAccountForDelete.set(account);
    this.showDeleteAccountModal.set(true);
  }

  closeDeleteAccountModal() {
    this.showDeleteAccountModal.set(false);
    this.selectedAccountForDelete.set(null);
    this.isDeletingAccount.set(false);
  }

  confirmDeleteAccount() {
    const account = this.selectedAccountForDelete();
    if (!account) return;

    const accountIdentifier = account.id || account.accountNumber;
    this.isDeletingAccount.set(true);

    this.adminService.deleteAccount(accountIdentifier)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error deleting account:', error);
          alert('Failed to delete account. Please try again.\n\nNote: Account may have active transactions or dependencies.');
          return of(null);
        })
      )
      .subscribe(result => {
        this.isDeletingAccount.set(false);
        
        if (result !== null) {
          // Remove the account from the list
          const accounts = this.allAccounts().filter(acc => 
            !(account.id && acc.id === account.id) && acc.accountNumber !== account.accountNumber
          );
          this.allAccounts.set(accounts);
          
          this.closeDeleteAccountModal();
          alert('Account deleted successfully!');
        }
      });
  }

  // Chart data calculation methods
  getTotalTransactionAmount(): number {
    return this.allTransactions().reduce((sum, transaction) => {
      const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  }

  getTransactionTypeData(): Array<{type: string, count: number, percentage: number}> {
    const transactions = this.allTransactions();
    if (transactions.length === 0) return [];

    const typeCounts = transactions.reduce((acc, transaction) => {
      acc[transaction.type] = (acc[transaction.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = transactions.length;
    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100)
    }));
  }

  getAccountTypeData(): Array<{type: string, count: number, percentage: number}> {
    const accounts = this.allAccounts();
    if (accounts.length === 0) return [];

    const typeCounts = accounts.reduce((acc, account) => {
      acc[account.accountType] = (acc[account.accountType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = accounts.length;
    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100)
    }));
  }

  getAverageTransactionAmount(): number {
    const transactions = this.allTransactions();
    if (transactions.length === 0) return 0;

    const total = this.getTotalTransactionAmount();
    return total / transactions.length;
  }

  getMostActiveTransactionType(): string {
    const typeData = this.getTransactionTypeData();
    if (typeData.length === 0) return 'None';

    const mostActive = typeData.reduce((max, current) => 
      current.count > max.count ? current : max
    );

    return mostActive.type.toUpperCase();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}