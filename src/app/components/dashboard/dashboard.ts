import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AccountService, Account, Transaction, CustomerProfile, UpdateProfileRequest } from '../../services/account.service';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';



interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  private router = inject(Router);
  private location = inject(Location);
  private authService = inject(AuthService);
  private accountService = inject(AccountService);
  
  // Navigation protection
  private browserNavigationBlocked = false;
  private routerSubscription: any;
  private popstateListener: any;
  
  // User state from auth service
  userType = signal<'user' | 'admin'>('user');
  currentUser = this.authService.currentUser;

  
  // Dashboard state
  activeSection = signal('overview');
  
  // User data
  userAccounts = signal<Account[]>([]);
  
  recentTransactions = signal<Transaction[]>([]);
  
  // Transaction filtering
  selectedAccountNumber = signal<string>('');
  filteredTransactions = signal<Transaction[]>([]);
  selectedMonth = signal<number>(new Date().getMonth() + 1);
  selectedYear = signal<number>(new Date().getFullYear());

  // Create Account Modal
  showCreateAccountModal = signal<boolean>(false);
  newAccountForm = {
    accountType: signal<string>(''),
    initialDeposit: signal<number>(0),
    customInterestRate: signal<number>(0)
  };

  // Deposit Modal
  showDepositModal = signal<boolean>(false);
  depositForm = {
    accountNumber: signal<string>(''),
    amount: signal<number>(0),
    description: signal<string>('')
  };

  // Withdrawal Modal
  showWithdrawModal = signal<boolean>(false);
  withdrawForm = {
    accountNumber: signal<string>(''),
    amount: signal<number>(0),
    description: signal<string>('')
  };

  // Transfer Modal
  showTransferModal = signal<boolean>(false);
  transferForm = {
    fromAccountNumber: signal<string>(''),
    toAccountNumber: signal<string>(''),
    amount: signal<number>(0),
    description: signal<string>('')
  };

  // Profile data
  userProfile = signal<CustomerProfile | null>(null);
  showEditProfileModal = signal<boolean>(false);
  profileForm = {
    firstName: signal<string>(''),
    lastName: signal<string>(''),
    email: signal<string>(''),
    phone: signal<string>(''),
    address: signal<string>(''),
    nationalId: signal<string>('')
  };
  
  // Admin data
  allCustomers = signal<Customer[]>([
    {
      id: '1',
      firstName: 'Kathryn',
      lastName: 'Murphy',
      email: 'kathryn.murphy@example.com',
      phone: '+1-555-0123',
      status: 'Active'
    },
    {
      id: '2',
      firstName: 'Courtney',
      lastName: 'Henry',
      email: 'courtney.henry@example.com',
      phone: '+1-555-0124',
      status: 'Active'
    }
  ]);
  
  allAccounts = signal<Account[]>([]);
  allTransactions = signal<Transaction[]>([]);

  ngOnInit() {
    console.log('Dashboard: Initializing...');
    
    // Set user type based on auth service data
    const user = this.authService.currentUser();
    console.log('Dashboard: Current user data:', user);
    if (user) {
      console.log('Dashboard: User type set to:', this.userType());
      console.log('Dashboard: User gender:', user.gender);
      console.log('Dashboard: User name:', user.firstName, user.lastName);
    } else {
      console.log('Dashboard: No user data found');
    }
    
    // Set up navigation protection
    this.setupNavigationProtection();
    
    // Load dashboard data
    this.loadDashboardData();
  }

  ngOnDestroy() {
    // Clean up subscriptions and listeners
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.popstateListener) {
      window.removeEventListener('popstate', this.popstateListener);
    }
  }

  private setupNavigationProtection() {
    // Minimal navigation protection - only handle browser back button
    this.popstateListener = (event: PopStateEvent) => {
      console.log('Dashboard: Browser back button detected');
      // Allow normal navigation, just log it
      console.log('Dashboard: User navigated back');
    };
    
    window.addEventListener('popstate', this.popstateListener);
    
    // Monitor router navigation for logging purposes only
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('Dashboard: Navigation to:', event.url);
      });

    // Handle page visibility change (user switches tabs)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.authService.isLoggedIn()) {
        console.log('Dashboard: Tab switched away - starting security timer');
        // Start a timer that will expire the session if user stays away too long
        setTimeout(() => {
          if (document.hidden && this.authService.isLoggedIn()) {
            this.authService.expireSession('Session expired: Tab was inactive for too long');
          }
        }, 120000); // 2 minutes
      }
    });
  }

  loadDashboardData() {
    // This would make API calls based on user type
    console.log('Dashboard: Current user type:', this.userType());
    console.log('Dashboard: Current user data:', this.currentUser());
    
    if (this.userType() === 'admin') {
      // Load admin data
      console.log('Loading admin dashboard data');
      this.loadAllAccounts();
      this.loadAllTransactions();
    } else {
      // Load user data
      console.log('Loading user dashboard data');
      this.loadUserAccounts();
      this.loadRecentTransactions();
      this.loadUserProfile();
    }
  }

    private loadRecentTransactions() {
      this.accountService.getRecentTransactions().subscribe({
        next: (transactions) => {
          console.log('Recent transactions loaded successfully:', transactions);
          this.recentTransactions.set(transactions);
          console.log('Recent transactions updated in signal', this.recentTransactions());
        },
        error: (error) => {
          console.error('Error loading recent transactions:', error);
        }
      });
    }

  private loadAllAccounts() {
    this.accountService.getAllAccounts().subscribe({
      next: (accounts) => {
        console.log('All accounts loaded successfully:', accounts);
        this.allAccounts.set(accounts);
      },
      error: (error) => {
        console.error('Error loading all accounts:', error);
      }
    });
  }

  private loadAllTransactions() {
    this.accountService.getAllTransactionsForAdmin().subscribe({
      next: (transactions) => {
        console.log('All transactions loaded successfully:', transactions);
        this.allTransactions.set(transactions);
      },
      error: (error) => {
        console.error('Error loading all transactions:', error);
      }
    });
  }

  private loadUserAccounts() {
    this.accountService.getUserAccounts().subscribe({
      next: (accounts) => {
        console.log('User accounts loaded successfully:', accounts);
        this.userAccounts.set(accounts);
      },
      error: (error) => {
        console.error('Error loading user accounts:', error);
        // Handle error - maybe show a notification to user
        if (error.status === 401) {
          console.log('Unauthorized - redirecting to login');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  private loadUserProfile() {
    console.log('Dashboard: Starting to load user profile...');
    this.accountService.getCurrentUserProfile().subscribe({
      next: (profile: CustomerProfile) => {
        console.log('User profile loaded successfully:', profile);
        this.userProfile.set(profile);
      },
      error: (error: any) => {
        console.error('Error loading user profile:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Full error object:', error);
        
        // For development/testing purposes, load sample data if API fails
        if (error.status === 404 || error.status === 0) {
          console.warn('API not available, loading sample profile data for testing...');
          this.loadSampleProfile();
        } else if (error.status === 401) {
          console.log('Unauthorized - redirecting to login');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  // Sample profile data for testing when API is not available
  private loadSampleProfile() {
    const sampleProfile: CustomerProfile = {
      id: 7,
      firstName: 'Tothpick',
      lastName: 'buddy',
      email: 'piku@email.com',
      phone: '1234509876',
      address: '123 Main St, City',
      nationalId: 'ID105',
      status: 'ACTIVE'
    };
    
    console.log('Loading sample profile data:', sampleProfile);
    this.userProfile.set(sampleProfile);
  }

  setActiveSection(section: string) {
    this.activeSection.set(section);
    
    // If switching to profile section and profile not loaded, force load it
    if (section === 'statistics' && !this.userProfile()) {
      console.log('Dashboard: Switching to profile section, forcing profile load...');
      this.loadUserProfile();
    }
  }

  // Profile management methods
  openEditProfileModal() {
    const profile = this.userProfile();
    if (profile) {
      this.profileForm.firstName.set(profile.firstName);
      this.profileForm.lastName.set(profile.lastName);
      this.profileForm.email.set(profile.email);
      this.profileForm.phone.set(profile.phone);
      this.profileForm.address.set(profile.address || '');
      this.profileForm.nationalId.set(profile.nationalId || '');
    }
    this.showEditProfileModal.set(true);
  }

  closeEditProfileModal() {
    this.showEditProfileModal.set(false);
    this.resetProfileForm();
  }

  resetProfileForm() {
    this.profileForm.firstName.set('');
    this.profileForm.lastName.set('');
    this.profileForm.email.set('');
    this.profileForm.phone.set('');
    this.profileForm.address.set('');
    this.profileForm.nationalId.set('');
  }

  updateProfile() {
    const profile = this.userProfile();
    if (!profile || !profile.id) {
      console.error('No profile data available');
      this.showNotification('Error: No profile data available', 'error');
      return;
    }

    // Validate required fields
    if (!this.profileForm.firstName() || !this.profileForm.lastName() || 
        !this.profileForm.email() || !this.profileForm.phone()) {
      this.showNotification('Please fill in all required fields', 'error');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.profileForm.email())) {
      this.showNotification('Please enter a valid email address', 'error');
      return;
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(this.profileForm.phone())) {
      this.showNotification('Please enter a valid phone number', 'error');
      return;
    }

    const updateRequest: UpdateProfileRequest = {
      firstName: this.profileForm.firstName().trim(),
      lastName: this.profileForm.lastName().trim(),
      email: this.profileForm.email().trim(),
      phone: this.profileForm.phone().trim(),
      address: this.profileForm.address().trim(),
      nationalId: this.profileForm.nationalId().trim()
    };

    console.log('Updating profile with data:', updateRequest);

    this.accountService.updateUserProfile(profile.id!, updateRequest).subscribe({
      next: (updatedProfile: CustomerProfile) => {
        console.log('Profile updated successfully:', updatedProfile);
        this.userProfile.set(updatedProfile);
        this.closeEditProfileModal();
        this.showNotification('Profile updated successfully!', 'success');
      },
      error: (error: any) => {
        console.error('Error updating profile:', error);
        let errorMessage = 'Failed to update profile. Please try again.';
        
        if (error.status === 400) {
          errorMessage = 'Invalid data provided. Please check your inputs.';
        } else if (error.status === 401) {
          errorMessage = 'Session expired. Please login again.';
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (error.status === 409) {
          errorMessage = 'Email already exists. Please use a different email.';
        }
        
        this.showNotification(errorMessage, 'error');
      }
    });
  }

  // Notification system (you can enhance this with a proper toast component)
  showNotification(message: string, type: 'success' | 'error' | 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);
    // TODO: Implement actual notification UI
    if (type === 'success') {
      alert(`✅ ${message}`);
    } else if (type === 'error') {
      alert(`❌ ${message}`);
    } else {
      alert(`ℹ️ ${message}`);
    }
  }

  // Form validation helpers
  isFormValid(): boolean {
    return !!(
      this.profileForm.firstName() &&
      this.profileForm.lastName() &&
      this.profileForm.email() &&
      this.profileForm.phone()
    );
  }

  hasFormChanges(): boolean {
    const profile = this.userProfile();
    if (!profile) return false;

    return (
      this.profileForm.firstName() !== profile.firstName ||
      this.profileForm.lastName() !== profile.lastName ||
      this.profileForm.email() !== profile.email ||
      this.profileForm.phone() !== profile.phone ||
      this.profileForm.address() !== (profile.address || '') ||
      this.profileForm.nationalId() !== (profile.nationalId || '')
    );
  }

  // Transaction filtering methods
  onAccountSelectionChange(accountNumber: string) {
    console.log('=== Account Selection Change ===');
    console.log('Account number received:', accountNumber);
    console.log('Account number type:', typeof accountNumber);
    console.log('Account number length:', accountNumber ? accountNumber.length : 0);
    console.log('Current selectedAccountNumber value:', this.selectedAccountNumber());
    
    this.selectedAccountNumber.set(accountNumber);
    console.log('Updated selectedAccountNumber to:', this.selectedAccountNumber());
    
    if (accountNumber && accountNumber.trim()) {
      console.log('Loading transactions for account:', accountNumber);
      this.loadAccountTransactions(accountNumber);
    } else {
      console.log('No account selected, clearing filtered transactions');
      // If no account selected, show recent transactions
      this.filteredTransactions.set([]);
    }
    console.log('================================');
  }

  // Get sorted accounts with selected account first for better UX
  getSortedAccountsForDropdown(): Account[] {
    const accounts = this.userAccounts();
    const selectedAccount = this.selectedAccountNumber();
    
    if (!selectedAccount) {
      return accounts;
    }
    
    // Find the selected account and move it to the top
    const selectedAccountObj = accounts.find(acc => acc.accountNumber === selectedAccount);
    if (selectedAccountObj) {
      const otherAccounts = accounts.filter(acc => acc.accountNumber !== selectedAccount);
      return [selectedAccountObj, ...otherAccounts];
    }
    
    return accounts;
  }

  // Helper method to get selected account display name for debugging
  getSelectedAccountDisplayName(): string {
    const selectedAccount = this.selectedAccountNumber();
    if (!selectedAccount) return 'No account selected';
    
    const account = this.userAccounts().find(acc => acc.accountNumber === selectedAccount);
    return account ? `${account.accountType} - ${account.accountNumber.slice(-4)}` : 'Unknown account';
  }

  // Helper method to get account info for deposit modal
  getAccountInfo(accountNumber: string): Account | undefined {
    return this.userAccounts().find(acc => acc.accountNumber === accountNumber);
  }


  onMonthYearChange(year: number, month: number) {
    this.selectedYear.set(year);
    this.selectedMonth.set(month);
    
    const accountNumber = this.selectedAccountNumber();
    if (accountNumber) {
      this.loadAccountTransactionsByMonth(accountNumber, year, month);
    }
  }

  private loadAccountTransactions(accountNumber: string) {
    console.log('=== Loading Account Transactions ===');
    console.log('Making API call for account:', accountNumber);
    console.log('Current month:', new Date().getMonth() + 1);
    console.log('Current year:', new Date().getFullYear());
    
    this.accountService.getAccountTransactionsThisMonth(accountNumber).subscribe({
      next: (transactions) => {
        console.log('Account transactions loaded successfully:', transactions);
        console.log('Number of transactions:', transactions.length);
        this.filteredTransactions.set(transactions);
        console.log('Filtered transactions updated in signal');
      },
      error: (error) => {
        console.error('Error loading account transactions:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        this.filteredTransactions.set([]);
      }
    });
    console.log('===================================');
  }

  private loadAccountTransactionsByMonth(accountNumber: string, year: number, month: number) {
    this.accountService.getAccountTransactionsMonthly(accountNumber, year, month).subscribe({
      next: (transactions) => {
        console.log('Account transactions by month loaded successfully:', transactions);
        this.filteredTransactions.set(transactions);
      },
      error: (error) => {
        console.error('Error loading account transactions by month:', error);
        this.filteredTransactions.set([]);
      }
    });
  }

  // Helper method to get available years for dropdown
  getAvailableYears(): number[] {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years;
  }

  // Helper method to get months
  getMonths(): { value: number, name: string }[] {
    return [
      { value: 1, name: 'January' },
      { value: 2, name: 'February' },
      { value: 3, name: 'March' },
      { value: 4, name: 'April' },
      { value: 5, name: 'May' },
      { value: 6, name: 'June' },
      { value: 7, name: 'July' },
      { value: 8, name: 'August' },
      { value: 9, name: 'September' },
      { value: 10, name: 'October' },
      { value: 11, name: 'November' },
      { value: 12, name: 'December' }
    ];
  }

  // Create Account Modal Methods
  openCreateAccountModal() {
    console.log('Opening create account modal');
    this.showCreateAccountModal.set(true);
    // Reset form
    this.newAccountForm.accountType.set('');
    this.newAccountForm.initialDeposit.set(0);
    this.newAccountForm.customInterestRate.set(0);
  }

  closeCreateAccountModal() {
    console.log('Closing create account modal');
    this.showCreateAccountModal.set(false);
  }

  updateAccountType(accountType: string) {
    console.log('Account type updated:', accountType);
    this.newAccountForm.accountType.set(accountType);
  }

  updateInitialDeposit(amount: number) {
    console.log('Initial deposit updated:', amount);
    this.newAccountForm.initialDeposit.set(amount);
  }

  updateCustomInterestRate(rate: number) {
    console.log('Custom interest rate updated:', rate);
    this.newAccountForm.customInterestRate.set(rate);
  }

  isCreateAccountFormValid(): boolean {
    return this.newAccountForm.accountType() !== '' && 
           this.newAccountForm.initialDeposit() > 0 && 
           this.newAccountForm.customInterestRate() > 0;
  }

  submitCreateAccount() {
    if (!this.isCreateAccountFormValid()) {
      console.error('Form is not valid');
      return;
    }

    const accountData = {
      accountType: this.newAccountForm.accountType(),
      initialDeposit: this.newAccountForm.initialDeposit(),
      customInterestRate: this.newAccountForm.customInterestRate()
    };

    console.log('Creating account with data:', accountData);
    
    // Call the existing createAccount method with proper parameters
    this.createAccount(accountData.accountType, accountData.initialDeposit);
    
    // Close modal
    this.closeCreateAccountModal();
  }

  // Deposit Modal Methods
  openDepositModal(accountNumber: string) {
    console.log('Opening deposit modal for account:', accountNumber);
    this.showDepositModal.set(true);
    // Pre-fill the account number
    this.depositForm.accountNumber.set(accountNumber);
    // Reset other form fields
    this.depositForm.amount.set(0);
    this.depositForm.description.set('');
  }

  closeDepositModal() {
    console.log('Closing deposit modal');
    this.showDepositModal.set(false);
    // Reset form
    this.depositForm.accountNumber.set('');
    this.depositForm.amount.set(0);
    this.depositForm.description.set('');
  }

  updateDepositAmount(amount: number) {
    console.log('Deposit amount updated:', amount);
    this.depositForm.amount.set(amount);
  }

  updateDepositDescription(description: string) {
    console.log('Deposit description updated:', description);
    this.depositForm.description.set(description);
  }

  isDepositFormValid(): boolean {
    return this.depositForm.accountNumber() !== '' && 
           this.depositForm.amount() > 0 && 
           this.depositForm.description().trim() !== '';
  }

  submitDeposit() {
    if (!this.isDepositFormValid()) {
      console.error('Deposit form is not valid');
      return;
    }

    const depositData = {
      accountNumber: this.depositForm.accountNumber(),
      amount: this.depositForm.amount(),
      description: this.depositForm.description()
    };

    console.log('Submitting deposit with data:', depositData);
    
    // Call the deposit API
    this.accountService.depositMoney(depositData).subscribe({
      next: (transaction) => {
        console.log('Deposit completed successfully:', transaction);
        // Refresh accounts and transactions
        this.loadUserAccounts();
        this.loadRecentTransactions();
        // Close modal
        this.closeDepositModal();
      },
      error: (error) => {
        console.error('Error making deposit:', error);
        if (error.status === 401) {
          console.log('Unauthorized - redirecting to login');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  // Withdrawal Modal Methods
  openWithdrawModal(accountNumber: string) {
    console.log('Opening withdrawal modal for account:', accountNumber);
    this.showWithdrawModal.set(true);
    // Pre-fill the account number
    this.withdrawForm.accountNumber.set(accountNumber);
    // Reset other form fields
    this.withdrawForm.amount.set(0);
    this.withdrawForm.description.set('');
  }

  closeWithdrawModal() {
    console.log('Closing withdrawal modal');
    this.showWithdrawModal.set(false);
    // Reset form
    this.withdrawForm.accountNumber.set('');
    this.withdrawForm.amount.set(0);
    this.withdrawForm.description.set('');
  }

  updateWithdrawAmount(amount: number) {
    console.log('Withdraw amount updated:', amount);
    this.withdrawForm.amount.set(amount);
  }

  updateWithdrawDescription(description: string) {
    console.log('Withdraw description updated:', description);
    this.withdrawForm.description.set(description);
  }

  isWithdrawFormValid(): boolean {
    const account = this.getAccountInfo(this.withdrawForm.accountNumber());
    const sufficientFunds = account ? this.withdrawForm.amount() <= account.balance : false;
    
    return this.withdrawForm.accountNumber() !== '' && 
           this.withdrawForm.amount() > 0 && 
           this.withdrawForm.description().trim() !== '' &&
           sufficientFunds;
  }

  submitWithdraw() {
    if (!this.isWithdrawFormValid()) {
      console.error('Withdrawal form is not valid');
      return;
    }

    const withdrawData = {
      accountNumber: this.withdrawForm.accountNumber(),
      amount: this.withdrawForm.amount(),
      description: this.withdrawForm.description()
    };

    console.log('Submitting withdrawal with data:', withdrawData);
    
    // Call the withdrawal API
    this.accountService.withdrawMoney(withdrawData).subscribe({
      next: (transaction) => {
        console.log('Withdrawal completed successfully:', transaction);
        // Refresh accounts and transactions
        this.loadUserAccounts();
        // this.loadRecentTransactions();
        // Close modal
        this.closeWithdrawModal();
      },
      error: (error) => {
        console.error('Error making withdrawal:', error);
        if (error.status === 401) {
          console.log('Unauthorized - redirecting to login');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  // Transfer Modal Methods
  openTransferModal(accountNumber: string) {
    console.log('Opening transfer modal for account:', accountNumber);
    this.showTransferModal.set(true);
    // Pre-fill the from account number
    this.transferForm.fromAccountNumber.set(accountNumber);
    // Reset other form fields
    this.transferForm.toAccountNumber.set('');
    this.transferForm.amount.set(0);
    this.transferForm.description.set('');
  }

  closeTransferModal() {
    console.log('Closing transfer modal');
    this.showTransferModal.set(false);
    // Reset form
    this.transferForm.fromAccountNumber.set('');
    this.transferForm.toAccountNumber.set('');
    this.transferForm.amount.set(0);
    this.transferForm.description.set('');
  }

  updateFromAccountNumber(accountNumber: string) {
    console.log('From account number updated:', accountNumber);
    this.transferForm.fromAccountNumber.set(accountNumber);
  }

  updateToAccountNumber(accountNumber: string) {
    console.log('To account number updated:', accountNumber);
    this.transferForm.toAccountNumber.set(accountNumber);
  }

  updateTransferAmount(amount: number) {
    console.log('Transfer amount updated:', amount);
    this.transferForm.amount.set(amount);
  }

  updateTransferDescription(description: string) {
    console.log('Transfer description updated:', description);
    this.transferForm.description.set(description);
  }

  isTransferFormValid(): boolean {
    const fromAccount = this.transferForm.fromAccountNumber();
    const toAccount = this.transferForm.toAccountNumber();
    const amount = this.transferForm.amount();
    
    // Check if all required fields are filled
    if (!fromAccount || !toAccount || amount <= 0) {
      return false;
    }
    
    // Check if from and to accounts are different
    if (fromAccount === toAccount) {
      return false;
    }
    
    // Check if sufficient balance is available
    const fromAccountData = this.getAccountInfo(fromAccount);
    if (!fromAccountData || fromAccountData.balance < amount) {
      return false;
    }
    
    return true;
  }

  submitTransfer() {
    if (!this.isTransferFormValid()) {
      console.error('Transfer form is not valid');
      return;
    }

    const transferData = {
      fromAccountNumber: this.transferForm.fromAccountNumber(),
      toAccountNumber: this.transferForm.toAccountNumber(),
      amount: this.transferForm.amount(),
      description: this.transferForm.description()
    };

    console.log('Submitting transfer with data:', transferData);
    
    // Call the transfer API
    this.accountService.transferFunds(transferData).subscribe({
      next: (transaction) => {
        console.log('Transfer completed successfully:', transaction);
        // Refresh accounts and transactions
        this.loadUserAccounts();
        // this.loadRecentTransactions();
        // Close modal
        this.closeTransferModal();
      },
      error: (error) => {
        console.error('Error making transfer:', error);
        if (error.status === 401) {
          console.log('Unauthorized - redirecting to login');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  toggleUserType() {
    // For demo purposes - toggle between user and admin
    this.userType.set(this.userType() === 'user' ? 'admin' : 'user');
  }

  logout() {
    // Use auth service to logout
    this.authService.logout();
    
    // Redirect to home
    this.router.navigate(['/home']);
  }

  // Account operations
  createAccount(accountType: string, initialDeposit?: number) {
    const accountData = {
      accountType,
      initialDeposit: initialDeposit || 0
    };

    console.log('Creating account with:', accountData);
    
    this.accountService.createAccount(accountData).subscribe({
      next: (account) => {
        console.log('Account created successfully:', account);
        // Refresh the accounts list
        this.loadUserAccounts();
      },
      error: (error) => {
        console.error('Error creating account:', error);
        if (error.status === 401) {
          console.log('Unauthorized - redirecting to login');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  updateAccountStatus(accountNumber: string, status: string) {
    this.accountService.updateAccountStatus(accountNumber, { status }).subscribe({
      next: () => {
        console.log('Account status updated successfully');
        // Refresh the accounts list
        this.loadUserAccounts();
      },
      error: (error) => {
        console.error('Error updating account status:', error);
      }
    });
  }

  updateInterestRate(accountNumber: string, rate: number) {
    this.accountService.updateInterestRate(accountNumber, { interestRate: rate }).subscribe({
      next: () => {
        console.log('Interest rate updated successfully');
        // Refresh the accounts list
        this.loadUserAccounts();
      },
      error: (error) => {
        console.error('Error updating interest rate:', error);
      }
    });
  }

  // Transaction operations
  transferFunds(fromAccountNumber: string, toAccountNumber: string, amount: number, description?: string) {
    this.accountService.transferFunds({ fromAccountNumber, toAccountNumber, amount, description }).subscribe({
      next: (transaction) => {
        console.log('Transfer completed successfully:', transaction);
        // Refresh accounts and transactions
        this.loadUserAccounts();
        // this.loadRecentTransactions();
      },
      error: (error) => {
        console.error('Error transferring funds:', error);
      }
    });
  }

  depositMoney(accountNumber: string, amount: number, description?: string) {
    this.accountService.depositMoney({ accountNumber, amount, description }).subscribe({
      next: (transaction) => {
        console.log('Deposit completed successfully:', transaction);
        // Refresh accounts and transactions
        this.loadUserAccounts();
        // this.loadRecentTransactions();
      },
      error: (error) => {
        console.error('Error depositing money:', error);
      }
    });
  }

  withdrawMoney(accountNumber: string, amount: number, description?: string) {
    this.accountService.withdrawMoney({ accountNumber, amount, description }).subscribe({
      next: (transaction) => {
        console.log('Withdrawal completed successfully:', transaction);
        // Refresh accounts and transactions
        this.loadUserAccounts();
        // this.loadRecentTransactions();
      },
      error: (error) => {
        console.error('Error withdrawing money:', error);
      }
    });
  }

  getTotalBalance(): string {
    console.log(this.userAccounts());
    const total = this.userAccounts().reduce((sum, acc) => sum + acc.balance, 0);
    return this.formatCurrency(total);
  }

  getCurrentMonthDeposits(): string {
    const currentDate = new Date();
    
    // Filter transactions for deposits in current month
    const currentMonthDeposits = this.recentTransactions().filter(transaction => {
       console.log("Apple : ",transaction.type);
      const transactionDate = new Date(transaction.date);
      return transaction.type.toLowerCase() === 'transfer'
    });

    // Calculate total transfer amount
    const totalTransfers = currentMonthDeposits.reduce((sum, transaction) => sum + transaction.amount, 0);
    
    return this.formatCurrency(totalTransfers);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }
}