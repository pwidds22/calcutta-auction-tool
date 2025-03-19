const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const marked = require('marked');

// Blog index page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../blog.html'));
});

// Individual blog post
router.get('/:slug', async (req, res) => {
    try {
        const postPath = path.join(__dirname, '../blog', `${req.params.slug}.md`);
        const content = await fs.readFile(postPath, 'utf8');
        const html = marked.parse(content);
        
        // Extract title and first paragraph for meta description
        const titleMatch = content.match(/# (.*)/);
        const title = titleMatch ? titleMatch[1] : req.params.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        
        const firstParagraphMatch = content.match(/\n\n(.*?)\n\n/);
        const description = firstParagraphMatch ? firstParagraphMatch[1].slice(0, 160) + '...' : 'Expert insights and strategies for March Madness Calcutta Auctions';

        // Create a template for the blog post
        const template = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <!-- Google tag (gtag.js) -->
                <script async src="https://www.googletagmanager.com/gtag/js?id=AW-16934024935"></script>
                <script>
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'AW-16934024935');
                </script>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title} - Calcutta Genius</title>
                <meta name="description" content="${description}">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
                <link rel="stylesheet" href="/css/blog.css">
            </head>
            <body>
                <!-- Navigation -->
                <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
                    <div class="container">
                        <a class="navbar-brand" href="/home">Calcutta Genius</a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarNav">
                            <ul class="navbar-nav ms-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/home#features">Features</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/home#pricing">Pricing</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/blog">Blog</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/login">Login</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link btn btn-light text-primary px-3" href="/register">Sign Up</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>

                <!-- Blog Post Content -->
                <main class="blog-post">
                    <header class="blog-post-header">
                        <div class="container">
                            <h1>${title}</h1>
                            <div class="blog-post-meta">
                                <span><i class="far fa-calendar"></i> March 17, 2024</span>
                                <span><i class="far fa-clock"></i> 10 min read</span>
                                <span><i class="fas fa-tag"></i> Strategy</span>
                            </div>
                        </div>
                    </header>

                    <article class="blog-post-content">
                        ${html}
                    </article>
                </main>

                <!-- Footer -->
                <footer class="bg-dark text-white py-4 mt-5">
                    <div class="container">
                        <div class="row">
                            <div class="col-md-6">
                                <h5>Calcutta Genius</h5>
                                <p>The ultimate tool for March Madness Calcutta auctions.</p>
                            </div>
                            <div class="col-md-3">
                                <h5>Links</h5>
                                <ul class="list-unstyled">
                                    <li><a href="/home#features" class="text-white">Features</a></li>
                                    <li><a href="/home#pricing" class="text-white">Pricing</a></li>
                                    <li><a href="/blog" class="text-white">Blog</a></li>
                                    <li><a href="/login" class="text-white">Login</a></li>
                                    <li><a href="/register" class="text-white">Sign Up</a></li>
                                </ul>
                            </div>
                            <div class="col-md-3">
                                <h5>Contact</h5>
                                <ul class="list-unstyled">
                                    <li><a href="mailto:support@calcuttagenius.com" class="text-white">support@calcuttagenius.com</a></li>
                                </ul>
                            </div>
                        </div>
                        <hr class="my-4">
                        <div class="text-center">
                            <p class="mb-0">&copy; 2024 Calcutta Genius. All rights reserved.</p>
                        </div>
                    </div>
                </footer>

                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
            </body>
            </html>
        `;
        
        res.send(template);
    } catch (error) {
        console.error('Error reading blog post:', error);
        res.status(404).send('Blog post not found');
    }
});

module.exports = router; 