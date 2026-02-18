"use client";
// eslint-disable-next-line deprecation/deprecation
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  // Link mapping function
  const getLinkHref = (category: string, link: string): string => {
    const linkMap: Record<string, Record<string, string>> = {
      Platform: {
        'Features': '#platform',
        'Integrations': '#platform',
        'Pricing': '#contact',
        'Security': '#solutions',
      },
      Resources: {
        'Help Center': '#contact',
        'API Reference': '#contact',
        'Blog': '#contact',
        'Case Studies': '#contact',
      },
      Company: {
        'About': '#company',
        'Careers': '#contact',
        'Contact': '#contact',
        'Press': '#contact',
      },
      Legal: {
        'Privacy': '#contact',
        'Terms': '#contact',
        'Compliance': '#solutions',
        'Cookies': '#contact',
      },
    };
    return linkMap[category]?.[link] || '#contact';
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    // If href doesn't start with '#', let Next.js Link handle navigation
  };

  const footerLinks = {
    Platform: ['Features', 'Integrations', 'Pricing', 'Security'],
    Resources: ['Help Center', 'API Reference', 'Blog', 'Case Studies'],
    Company: ['About', 'Careers', 'Contact', 'Press'],
    Legal: ['Privacy', 'Terms', 'Compliance', 'Cookies'],
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Mail, href: 'mailto:contact@niyamr.com', label: 'Email' },
  ];

  return (
    <footer id="contact" className="relative pt-20 pb-8 border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="relative">
                <Image
                  src="/images/logo.png"
                  alt="NiyamR Flow"
                  className="rounded-xl transition-transform duration-300 group-hover:scale-105"
                  width={50}
                  height={50}
                />
              </div>
            
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              The unified AI Governance platform for enterprise safety, compliance, and observability.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-secondary/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                  aria-label={social.label}
                  {...(social.href.startsWith('http') || social.href.startsWith('mailto:') 
                    ? { target: '_blank', rel: 'noopener noreferrer' } 
                    : {})}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => {
                  const href = getLinkHref(category, link);
                  const isExternalLink = href.startsWith('http') || href.startsWith('mailto:');
                  const isInternalPage = href.startsWith('/') && !href.startsWith('/#');
                  
                  if (isInternalPage) {
                    return (
                      <li key={link}>
                        <Link 
                          href={href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {link}
                        </Link>
                      </li>
                    );
                  }
                  
                  return (
                    <li key={link}>
                      <a 
                        href={href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        onClick={(e) => handleLinkClick(e, href)}
                        {...(isExternalLink ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        {link}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 NiyamR. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-muted-foreground">SOC2 Certified</span>
            <span className="text-sm text-muted-foreground">ISO 27001</span>
            <span className="text-sm text-muted-foreground">GDPR Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

