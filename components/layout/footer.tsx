"use client"

import Link from "next/link"
import { Sparkles, Twitter, Github, Linkedin } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

export function Footer() {
  const { t } = useLanguage()

  const footerLinks = {
    product: [
      { label: t.footer.links.features, href: "#features" },
      { label: t.footer.links.pricing, href: "#pricing" },
      { label: t.footer.links.templates, href: "/dashboard/templates" },
      { label: t.footer.links.api, href: "/docs/api" },
    ],
    resources: [
      { label: t.footer.links.documentation, href: "/docs" },
      { label: t.footer.links.blog, href: "/blog" },
      { label: t.footer.links.changelog, href: "/changelog" },
      { label: t.footer.links.support, href: "/support" },
    ],
    company: [
      { label: t.footer.links.about, href: "/about" },
      { label: t.footer.links.careers, href: "/careers" },
      { label: t.footer.links.privacyLink, href: "/privacy" },
      { label: t.footer.links.termsLink, href: "/terms" },
    ],
  }

  return (
    <footer className="border-t border-border bg-sidebar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">PromptCraft</span>
            </Link>
            <p className="text-sm text-foreground-secondary mb-4">{t.footer.description}</p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg hover:bg-surface transition-colors">
                <Twitter className="w-5 h-5 text-foreground-secondary" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-surface transition-colors">
                <Github className="w-5 h-5 text-foreground-secondary" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-surface transition-colors">
                <Linkedin className="w-5 h-5 text-foreground-secondary" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t.footer.product}</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t.footer.resources}</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t.footer.company}</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-foreground-muted">{t.footer.copyright}</p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-sm text-foreground-muted hover:text-foreground-secondary transition-colors"
            >
              {t.footer.privacy}
            </Link>
            <Link
              href="/terms"
              className="text-sm text-foreground-muted hover:text-foreground-secondary transition-colors"
            >
              {t.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
