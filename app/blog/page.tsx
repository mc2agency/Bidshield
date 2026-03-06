'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';

const blogPosts = [
  {
    slug: 'commercial-roofing-scope-of-work-checklist',
    title: 'Commercial Roofing Scope of Work: 40-Item Checklist for Estimators',
    excerpt: 'A complete scope of work checklist for commercial roofing bids. Learn what to include, what to exclude, and which scope gaps cause the most costly change orders.',
    category: 'Estimation',
    author: 'MC2 Estimating',
    date: 'March 5, 2026',
    readTime: '10 min read',
    featured: false,
    image: '/images/blog/scope-of-work.jpg',
  },
  {
    slug: 'roofing-takeoff-mistakes',
    title: '7 Roofing Takeoff Mistakes That Cost Estimators Money',
    excerpt: 'The most common roofing takeoff mistakes — from ignoring pitch factors to skipping peer review — and exactly how to prevent them on every bid.',
    category: 'Estimation',
    author: 'MC2 Estimating',
    date: 'March 4, 2026',
    readTime: '9 min read',
    featured: false,
    image: '/images/blog/takeoff-mistakes.jpg',
  },
  {
    slug: 'commercial-roofing-estimate-template',
    title: 'Commercial Roofing Estimate Template: What Every Bid Must Include',
    excerpt: 'The 8 sections every professional commercial roofing estimate needs — plus formatting tips that help you win more work.',
    category: 'Templates',
    author: 'MC2 Estimating',
    date: 'March 3, 2026',
    readTime: '8 min read',
    featured: false,
    image: '/images/blog/estimate-template.jpg',
  },
  {
    slug: 'how-to-win-more-commercial-roofing-bids',
    title: 'How to Win More Commercial Roofing Bids: 6 Strategies That Work',
    excerpt: 'Practical strategies to improve your bid win rate — from tracking $/SF by GC to the pre-submission review process that catches errors before they cost you.',
    category: 'Business',
    author: 'MC2 Estimating',
    date: 'March 2, 2026',
    readTime: '10 min read',
    featured: false,
    image: '/images/blog/win-bids.jpg',
  },
  {
    slug: 'how-to-calculate-roof-pitch',
    title: 'How to Calculate Roof Pitch in 3 Easy Steps [With Calculator]',
    excerpt: 'Master roof pitch calculations with our complete guide. Includes pitch multiplier tables, step-by-step instructions, and a free calculator to speed up your estimates.',
    category: 'Estimation',
    author: 'MC2 Estimating',
    date: 'December 10, 2025',
    readTime: '8 min read',
    featured: true,
    image: '/images/blog/roof-pitch.jpg',
  },
  {
    slug: 'labor-burden-calculation-guide',
    title: 'Labor Burden Calculation for Contractors [Complete Guide 2025]',
    excerpt: 'Learn how to accurately calculate labor burden including FICA, Medicare, workers comp, and all hidden costs. Avoid losing money on every job.',
    category: 'Business',
    author: 'MC2 Estimating',
    date: 'December 8, 2025',
    readTime: '12 min read',
    featured: false,
    image: '/images/blog/labor-burden.jpg',
  },
  {
    slug: 'reading-construction-specifications',
    title: 'How to Read Construction Specifications (CSI MasterFormat Guide)',
    excerpt: 'Complete guide to understanding CSI MasterFormat, finding roofing information in specs, and resolving spec vs drawing conflicts like a professional estimator.',
    category: 'Plans & Specs',
    author: 'MC2 Estimating',
    date: 'December 5, 2025',
    readTime: '10 min read',
    featured: false,
    image: '/images/blog/construction-specs.jpg',
  },
  {
    slug: 'bluebeam-vs-planswift',
    title: 'Bluebeam vs PlanSwift: Which Estimating Software is Better?',
    excerpt: 'Detailed comparison of Bluebeam and PlanSwift for roofing estimators. Features, pricing, pros, cons, and which one is right for your business.',
    category: 'Technology',
    author: 'MC2 Estimating',
    date: 'December 3, 2025',
    readTime: '9 min read',
    featured: false,
    image: '/images/blog/software-comparison.jpg',
  },
  {
    slug: 'roofing-estimate-template-excel',
    title: 'Free Roofing Estimate Template for Excel [2025 Download]',
    excerpt: 'Download our free Excel roofing estimate template. Learn what every professional estimate should include and get started with our proven format.',
    category: 'Templates',
    author: 'MC2 Estimating',
    date: 'December 1, 2025',
    readTime: '6 min read',
    featured: false,
    image: '/images/blog/excel-template.jpg',
  },
  {
    slug: 'what-is-a-roof-square',
    title: 'What is a Roof Square? Complete Guide for Estimators',
    excerpt: 'Understanding roof squares is fundamental to accurate roofing estimates. Learn how to measure, calculate, and use roof squares in your bids.',
    category: 'Estimation',
    author: 'MC2 Estimating',
    date: 'November 28, 2025',
    readTime: '7 min read',
    featured: false,
    image: '/images/blog/roof-square.jpg',
  },
  {
    slug: 'general-conditions-checklist',
    title: 'General Conditions Checklist for Construction Estimators',
    excerpt: 'Never miss general conditions costs again. Our comprehensive checklist covers every overhead item that should be in your estimate.',
    category: 'Estimation',
    author: 'MC2 Estimating',
    date: 'November 25, 2025',
    readTime: '10 min read',
    featured: false,
    image: '/images/blog/general-conditions.jpg',
  },
  {
    slug: 'standing-seam-metal-roofing-guide',
    title: 'Standing Seam Metal Roofing: Complete Estimating Guide',
    excerpt: 'Everything you need to know about estimating standing seam metal roofing projects — materials, labor, and pricing breakdowns.',
    category: 'Estimation',
    author: 'MC2 Estimating',
    date: 'November 22, 2025',
    readTime: '11 min read',
    featured: false,
    image: '/images/blog/standing-seam.jpg',
  },
  {
    slug: 'tpo-vs-pvc-vs-epdm',
    title: 'TPO vs PVC vs EPDM: Which Single-Ply Membrane is Best?',
    excerpt: 'Compare the three major single-ply roofing membranes. Cost breakdowns, pros and cons, and which to recommend to your clients.',
    category: 'Estimation',
    author: 'MC2 Estimating',
    date: 'November 19, 2025',
    readTime: '9 min read',
    featured: false,
    image: '/images/blog/single-ply.jpg',
  },
  {
    slug: 'spray-foam-roofing-101',
    title: 'Spray Foam Roofing 101: Estimating Guide for Contractors',
    excerpt: 'A complete introduction to spray polyurethane foam roofing — application methods, costs, and how to estimate SPF projects accurately.',
    category: 'Estimation',
    author: 'MC2 Estimating',
    date: 'November 16, 2025',
    readTime: '8 min read',
    featured: false,
    image: '/images/blog/spray-foam.jpg',
  },
  {
    slug: 'pictometry-vs-eagleview',
    title: 'Pictometry vs EagleView: Aerial Measurement Tools Compared',
    excerpt: 'Detailed comparison of the two leading aerial measurement platforms for roofing contractors and estimators.',
    category: 'Technology',
    author: 'MC2 Estimating',
    date: 'November 13, 2025',
    readTime: '8 min read',
    featured: false,
    image: '/images/blog/aerial-measurement.jpg',
  },
  {
    slug: 'buildingconnected-guide',
    title: 'BuildingConnected Guide: Win More Bids Online',
    excerpt: 'How to use BuildingConnected to find projects, submit bids, and grow your roofing business through the largest preconstruction platform.',
    category: 'Business',
    author: 'MC2 Estimating',
    date: 'November 10, 2025',
    readTime: '7 min read',
    featured: false,
    image: '/images/blog/buildingconnected.jpg',
  },
];

const categories = ['All', 'Estimation', 'Business', 'Plans & Specs', 'Technology', 'Templates'];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { filteredPosts, featuredPost, regularPosts } = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    const filtered = blogPosts.filter((post) => {
      const matchesSearch = searchQuery === '' ||
                           post.title.toLowerCase().includes(searchLower) ||
                           post.excerpt.toLowerCase().includes(searchLower);
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const featured = blogPosts.find(post => post.featured);
    const regular = filtered.filter(post => !post.featured || selectedCategory !== 'All' || searchQuery !== '');

    return { filteredPosts: filtered, featuredPost: featured, regularPosts: regular };
  }, [searchQuery, selectedCategory]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">BidShield Blog</h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Expert guides, tutorials, and industry insights for construction estimators and roofing contractors.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Search & Filter */}
            <div className="mb-8">
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Post */}
            {featuredPost && selectedCategory === 'All' && searchQuery === '' && (
              <div className="mb-12">
                <div className="text-sm font-semibold text-blue-600 mb-2">FEATURED POST</div>
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="group block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-video bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <div className="text-white text-6xl">📐</div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        {featuredPost.category}
                      </span>
                      <span>{featuredPost.date}</span>
                      <span>{featuredPost.readTime}</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-600 text-lg mb-4">{featuredPost.excerpt}</p>
                    <div className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform inline-block">
                      Read Article →
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Blog Posts Grid */}
            <div className="space-y-8">
              {regularPosts.length > 0 ? (
                regularPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="md:flex">
                      <div className="md:w-64 md:flex-shrink-0 aspect-video md:aspect-square bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <div className="text-white text-5xl">
                          {post.category === 'Estimation' && '📐'}
                          {post.category === 'Business' && '💼'}
                          {post.category === 'Plans & Specs' && '📋'}
                          {post.category === 'Technology' && '⚡'}
                          {post.category === 'Templates' && '📄'}
                        </div>
                      </div>
                      <div className="p-6 flex-1">
                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium">
                            {post.category}
                          </span>
                          <span>{post.date}</span>
                          <span>{post.readTime}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-3">{post.excerpt}</p>
                        <div className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform inline-block">
                          Read More →
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-xl">
                  <p className="text-gray-500 text-lg">No articles found matching your criteria.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">1</button>
                <button className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100 border border-gray-300">2</button>
                <button className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100 border border-gray-300">3</button>
                <button className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100 border border-gray-300">Next →</button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Newsletter Signup */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold mb-3">Get Weekly Tips</h3>
              <p className="text-blue-100 mb-4">
                Get practical estimating tips delivered to your inbox every Tuesday.
              </p>
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-2 rounded-lg mb-3 text-gray-900"
              />
              <button className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Subscribe
              </button>
              <p className="text-xs text-blue-200 mt-2">No spam. Unsubscribe anytime.</p>
            </div>

            {/* Popular Posts */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Posts</h3>
              <div className="space-y-4">
                {blogPosts.slice(0, 4).map((post, index) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="block group"
                  >
                    <div className="flex gap-3">
                      <div className="text-2xl font-bold text-gray-300">{index + 1}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm leading-tight">
                          {post.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{post.readTime}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.filter(cat => cat !== 'All').map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-gray-700 font-medium">{category}</span>
                    <span className="text-gray-400 text-sm float-right">
                      {blogPosts.filter(post => post.category === category).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-blue-500">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to Level Up?</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Get instant access to professional templates and tools.
              </p>
              <Link
                href="/products"
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                View Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
