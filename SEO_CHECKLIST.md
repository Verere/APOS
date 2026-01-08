# SEO Launch Checklist - MarketBook

## Pre-Launch (Do These First) ⚠️

### Environment Setup
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://marketbook.app` (or your actual domain)
- [ ] Update business contact info in `src/lib/seo.js` (address, phone, email)

### Content Verification
- [ ] Review homepage metadata (title, description)
- [ ] Check all internal links work
- [ ] Test all 4 pages load correctly:
  - [ ] Homepage (/)
  - [ ] POS System (/features/pos-system)
  - [ ] Inventory Management (/features/inventory-management)
  - [ ] Retail Industry (/industry/retail)

### Technical Checks
- [ ] Sitemap generates correctly: visit `/sitemap.xml`
- [ ] Robots.txt accessible: visit `/robots.txt`
- [ ] All images use Next.js `<Image>` component
- [ ] No console errors on any page
- [ ] Mobile responsive on phone/tablet

---

## Launch Day 🚀

### Deploy
- [ ] Deploy to production (Vercel/other hosting)
- [ ] Verify all pages load on production URL
- [ ] Check production sitemap: `https://yourdomain.com/sitemap.xml`

### Google Search Console
- [ ] Create account at [search.google.com/search-console](https://search.google.com/search-console)
- [ ] Add property: `https://yourdomain.com`
- [ ] Verify ownership (DNS or meta tag method)
- [ ] Submit sitemap: `https://yourdomain.com/sitemap.xml`
- [ ] Request indexing for:
  - [ ] Homepage
  - [ ] /features/pos-system
  - [ ] /features/inventory-management
  - [ ] /industry/retail

### Google Analytics (Optional but Recommended)
- [ ] Create GA4 property at [analytics.google.com](https://analytics.google.com)
- [ ] Get Measurement ID (format: G-XXXXXXXXXX)
- [ ] Add to environment variables
- [ ] Install GA4 script in root layout
- [ ] Test with GA4 DebugView

---

## Week 1: Monitoring 👀

### Daily Checks (First Week)
- [ ] Check Google Search Console for indexing status
- [ ] Verify no crawl errors
- [ ] Check page experience report (Core Web Vitals)
- [ ] Monitor for any 404 errors

### Validation
- [ ] Test schema markup: [validator.schema.org](https://validator.schema.org)
- [ ] Test mobile-friendly: [search.google.com/test/mobile-friendly](https://search.google.com/test/mobile-friendly)
- [ ] Test page speed: [pagespeed.web.dev](https://pagespeed.web.dev)
- [ ] Check if pages are indexed: Google search "site:yourdomain.com"

---

## Week 2-3: Content Expansion 📝

### Create 12 More Feature Pages
Priority order (create these first):
1. [ ] Financial Tracking (`/features/financial-tracking`)
2. [ ] Debt Management (`/features/debt-management`)
3. [ ] Credit Control (`/features/credit-control`)
4. [ ] Barcode Scanner (`/features/barcode-scanner`)
5. [ ] Multi-Store (`/features/multi-store`)
6. [ ] Expense Tracking (`/features/expense-tracking`)
7. [ ] Sales Reports (`/features/sales-reports`)
8. [ ] Customer Management (`/features/customer-management`)
9. [ ] Employee Management (`/features/employee-management`)
10. [ ] Pricing Controls (`/features/pricing-controls`)
11. [ ] Low Stock Alerts (`/features/low-stock-alerts`)
12. [ ] Receipt Printing (`/features/receipt-printing`)

**After each page:**
- [ ] Add to `sitemap.js` static pages array
- [ ] Deploy to production
- [ ] Request indexing in Google Search Console

---

## Week 4: Industry Expansion 🏪

### Create 7 More Industry Pages
1. [ ] Restaurant (`/industry/restaurant`)
2. [ ] Pharmacy (`/industry/pharmacy`)
3. [ ] Supermarket (`/industry/supermarket`)
4. [ ] Fashion Boutique (`/industry/fashion-boutique`)
5. [ ] Hardware Store (`/industry/hardware-store`)
6. [ ] Salon & Spa (`/industry/salon-spa`)
7. [ ] Bar & Lounge (`/industry/bar-lounge`)

---

## Ongoing: Weekly Maintenance 🔄

### Every Monday
- [ ] Check Google Search Console Performance report
- [ ] Note any new queries with impressions
- [ ] Check for indexing issues or errors
- [ ] Review Core Web Vitals

### Every Wednesday
- [ ] Analyze top 10 pages by impressions
- [ ] Identify pages ranking 11-20 (optimization opportunities)
- [ ] Check CTR for high-impression pages (low CTR = improve title/description)

### Every Friday
- [ ] Check for 404 errors
- [ ] Review competitor pages for content ideas
- [ ] Plan next week's content
- [ ] Update one underperforming page

---

## Monthly Review 📊

### Traffic Analysis
- [ ] Total organic sessions vs last month
- [ ] Top 10 landing pages
- [ ] New keywords in top 50
- [ ] Total keywords ranking (1-100)

### Engagement Metrics
- [ ] Average session duration
- [ ] Bounce rate by page type
- [ ] Pages per session
- [ ] Conversion rate (sign-ups from organic)

### Content Updates
- [ ] Update 2-3 pages with new content
- [ ] Add new FAQ questions based on user queries
- [ ] Refresh statistics and dates
- [ ] Fix any broken links

### Optimization
- [ ] Improve titles/descriptions for pages with high impressions but low CTR
- [ ] Expand content on pages ranking 11-20
- [ ] Add internal links from high-traffic pages to new pages

---

## 6-Month Goals 🎯

By Month 6, you should have:
- [ ] 40+ pages indexed
- [ ] 5-8 keywords in Google top 10
- [ ] 15-20 keywords in Google top 20
- [ ] 2,000-5,000 monthly organic visitors
- [ ] 100+ free sign-ups from organic traffic
- [ ] Featured snippets in Google (FAQs, lists)

---

## Red Flags (Fix Immediately) 🚨

If you see any of these, take action:
- ❌ Pages not indexing after 2 weeks → Check robots.txt and sitemap
- ❌ Core Web Vitals in red → Optimize images and JavaScript
- ❌ High bounce rate (>70%) → Improve content relevance
- ❌ Many 404 errors → Fix broken links
- ❌ Crawl errors → Fix server issues
- ❌ Manual actions in Search Console → Address issue immediately

---

## Quick Reference Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Check for build errors
npm run lint
```

---

## Files You'll Edit Most Often

1. **New feature pages:** Create in `src/app/features/[name]/page.js`
2. **New industry pages:** Create in `src/app/industry/[name]/page.js`
3. **Sitemap updates:** Edit `src/app/sitemap.js` (add to staticPages array)
4. **SEO config:** Edit `src/lib/seo.js` (business info, defaults)
5. **Schema templates:** Edit `src/lib/schema.js` (if needed)

---

## Common Issues & Solutions

**Issue:** Pages not showing in Google after 2 weeks  
**Solution:** 
1. Check if sitemap submitted in Search Console
2. Use "Request Indexing" for specific pages
3. Ensure robots.txt allows crawling
4. Check for noindex tags

**Issue:** Low CTR despite good rankings  
**Solution:**
1. Improve title tag (add benefit/number)
2. Improve meta description (add CTA)
3. Add schema markup for rich snippets

**Issue:** High bounce rate  
**Solution:**
1. Improve page speed (<3s load time)
2. Make content more engaging (add visuals)
3. Ensure content matches search intent
4. Add clear CTAs above fold

**Issue:** Keywords not ranking  
**Solution:**
1. Check if page is indexed
2. Improve content depth (add 500-1000 words)
3. Add more internal links to page
4. Optimize for long-tail variations

---

## Success Milestones 🏆

Celebrate when you hit these:
- ✅ First page indexed
- ✅ First keyword in top 100
- ✅ First keyword in top 50
- ✅ First keyword in top 10
- ✅ 100 monthly organic visitors
- ✅ 1,000 monthly organic visitors
- ✅ First organic sign-up
- ✅ First featured snippet
- ✅ 10 keywords in top 20

---

## Resources Quick Links

- [Google Search Console](https://search.google.com/search-console)
- [Google Analytics](https://analytics.google.com)
- [Schema Validator](https://validator.schema.org)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [PageSpeed Insights](https://pagespeed.web.dev)
- [Rich Results Test](https://search.google.com/test/rich-results)

---

**Print this checklist and track your progress! ✓**

**Last Updated:** January 8, 2026
