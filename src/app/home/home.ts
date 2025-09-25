import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private router = inject(Router);

  // FAQ properties
  activeFaq: string | null = null;

  // Feature properties
  activeFeature: string = 'online-banking';

  // Product properties
  activeProductTab: string = 'savings';

  // Testimonials properties
  currentTestimonial: number = 0;
  testimonials = [
    {
      name: 'Sara T',
      text: 'YourBank has been my trusted financial partner for years. Their personalized service and innovative digital banking solutions have made managing my finances a breeze.'
    },
    {
      name: 'John D',
      text: 'I recently started my own business, and YourBank has been instrumental in helping me set up my business accounts and secure the financing I needed. Their expert guidance and tailored solutions have been invaluable.'
    },
    {
      name: 'Emily S',
      text: 'I love the convenience of YourBank\'s mobile banking app. It allows me to stay on top of my finances and make transactions on the go. The app is user-friendly and gives me peace of mind.'
    },
    {
      name: 'Michael R',
      text: 'The customer service at YourBank is exceptional. Whenever I have questions or need assistance, their team is always ready to help with professional and friendly support.'
    },
    {
      name: 'Lisa M',
      text: 'YourBank\'s investment services have helped me grow my wealth significantly. Their financial advisors provided excellent guidance tailored to my goals.'
    },
    {
      name: 'David K',
      text: 'The online banking platform is intuitive and secure. I can manage all my accounts, pay bills, and transfer money with complete confidence.'
    }
  ];

  // Product data
  productData = {
    savings: [
      {
        icon: '🏛️',
        title: 'Basic Savings Account',
        description: 'Build your savings with our competitive interest rates and flexible savings account options. Perfect for emergency funds and short-term financial goals.'
      },
      {
        icon: '💎',
        title: 'Premium Savings Account',
        description: 'Enjoy higher interest rates and premium benefits with our premium savings account. Ideal for long-term wealth building and major financial milestones.'
      },
      {
        icon: '🎯',
        title: 'Goal-Based Savings',
        description: 'Set and achieve your financial goals with our specialized savings plans. Whether it\'s a vacation, home purchase, or education fund, we help you save systematically.'
      }
    ],
    current: [
      {
        icon: '💳',
        title: 'Basic Current Account',
        description: 'Enjoy easy and convenient access to your funds with our basic current account. Perfect for daily transactions with online and mobile banking features.'
      },
      {
        icon: '🏢',
        title: 'Business Current Account',
        description: 'Streamline your business operations with our comprehensive business current account. Features include bulk transactions, payroll management, and business debit cards.'
      },
      {
        icon: '⭐',
        title: 'Premium Current Account',
        description: 'Experience premium banking with enhanced features including priority customer service, higher transaction limits, and exclusive banking privileges.'
      }
    ]
  };

  // Feature data
  featureData = {
    'online-banking': [
      {
        icon: '⚡',
        title: '24/7 Account Access',
        description: 'Access your accounts anytime, anywhere through our secure online banking platform. Check balances, transfer funds, and pay bills with ease.'
      },
      {
        icon: '🔐',
        title: 'Secure Login',
        description: 'Multi-factor authentication and biometric login options ensure your account remains secure while providing convenient access.'
      },
      {
        icon: '📊',
        title: 'Account Dashboard',
        description: 'Get a comprehensive view of all your accounts, recent transactions, and account summaries in one convenient dashboard.'
      },
      {
        icon: '💸',
        title: 'Quick Transfers',
        description: 'Transfer money between your accounts or to other banks instantly with our fast and secure transfer system.'
      }
    ],
    'financial-tools': [
      {
        icon: '📈',
        title: 'Expense Tracking',
        description: 'Track your spending patterns and categorize expenses to better understand your financial habits and make informed decisions.'
      },
      {
        icon: '🎯',
        title: 'Budget Planner',
        description: 'Create and manage budgets with our intelligent planning tools. Set spending limits and receive alerts when approaching your limits.'
      },
      {
        icon: '💰',
        title: 'Investment Calculator',
        description: 'Plan your investments with our advanced calculators. Estimate returns, compare investment options, and optimize your portfolio.'
      },
      {
        icon: '📋',
        title: 'Financial Reports',
        description: 'Generate detailed financial reports and statements to track your progress and prepare for tax filing or financial planning.'
      }
    ],
    'customer-support': [
      {
        icon: '🎧',
        title: '24/7 Support',
        description: 'Our customer support team is available round the clock to assist you with any banking queries or technical issues.'
      },
      {
        icon: '💬',
        title: 'Live Chat',
        description: 'Get instant help through our live chat feature. Connect with support agents in real-time for quick resolution of your concerns.'
      },
      {
        icon: '📞',
        title: 'Phone Support',
        description: 'Speak directly with our banking experts through our dedicated phone support lines for personalized assistance.'
      },
      {
        icon: '📧',
        title: 'Email Support',
        description: 'Send us your queries via email and receive detailed responses from our support team within 24 hours.'
      }
    ]
  };

  get visibleTestimonials() {
    return this.testimonials.slice(this.currentTestimonial, this.currentTestimonial + 3);
  }

  get currentProducts() {
    return this.productData[this.activeProductTab as keyof typeof this.productData];
  }

  get currentFeatures() {
    return this.featureData[this.activeFeature as keyof typeof this.featureData];
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  navigateToAbout() {
    this.router.navigate(['/about']);
  }

  navigateToCareer() {
    this.router.navigate(['/career']);
  }

  // FAQ methods
  toggleFaq(faqId: string) {
    this.activeFaq = this.activeFaq === faqId ? null : faqId;
  }

  // Product methods
  selectProductTab(tab: string) {
    this.activeProductTab = tab;
  }

  // Feature methods
  selectFeature(feature: string) {
    this.activeFeature = feature;
  }

  // Testimonial navigation methods
  nextTestimonial() {
    if (this.currentTestimonial < this.testimonials.length - 3) {
      this.currentTestimonial++;
    }
  }

  previousTestimonial() {
    if (this.currentTestimonial > 0) {
      this.currentTestimonial--;
    }
  }
}
