import { useEffect } from 'react';

interface MetadataProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile' | 'video';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

/**
 * Component to dynamically update meta tags for SEO
 * 
 * Usage:
 * <DynamicMetadata 
 *   title="Post Title" 
 *   description="Post description"
 *   image="https://example.com/image.jpg"
 *   type="article"
 *   canonicalUrl="https://yoop.app/posts/123"
 *   publishedTime="2023-01-01T00:00:00Z"
 *   author="John Doe"
 *   tags={["social", "media"]}
 * />
 */
const DynamicMetadata = ({
  title,
  description,
  canonicalUrl,
  image,
  type = 'website',
  twitterCard = 'summary_large_image',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = []
}: MetadataProps) => {
  useEffect(() => {
    // Set defaults if not provided
    const appName = 'Yoop';
    const defaultTitle = 'Yoop - Connect, Share, Discover';
    const defaultDescription = 'Join Yoop, the social media platform where you can connect with friends, share moments, and discover exciting content.';
    const defaultImage = '/icons/icon-512x512.png';
    const siteUrl = window.location.origin;

    // Current URL
    const currentUrl = window.location.href;
    
    // Update document title
    if (title) {
      document.title = `${title} | ${appName}`;
    }
    
    // Helper function to create or update meta tags
    const setMetaTag = (name: string, content: string, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper function to create or update link tags
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };
    
    // Basic meta tags
    setMetaTag('description', description || defaultDescription);
    
    // Open Graph meta tags
    setMetaTag('og:title', title ? `${title} | ${appName}` : defaultTitle, 'property');
    setMetaTag('og:description', description || defaultDescription, 'property');
    setMetaTag('og:url', canonicalUrl || currentUrl, 'property');
    setMetaTag('og:image', image || (siteUrl + defaultImage), 'property');
    setMetaTag('og:type', type, 'property');
    setMetaTag('og:site_name', appName, 'property');
    
    // Twitter Card meta tags
    setMetaTag('twitter:card', twitterCard, 'name');
    setMetaTag('twitter:title', title ? `${title} | ${appName}` : defaultTitle, 'name');
    setMetaTag('twitter:description', description || defaultDescription, 'name');
    setMetaTag('twitter:image', image || (siteUrl + defaultImage), 'name');
    
    // Article specific meta tags (if type is article)
    if (type === 'article') {
      if (publishedTime) {
        setMetaTag('article:published_time', publishedTime, 'property');
      }
      if (modifiedTime) {
        setMetaTag('article:modified_time', modifiedTime, 'property');
      }
      if (author) {
        setMetaTag('article:author', author, 'property');
      }
      if (section) {
        setMetaTag('article:section', section, 'property');
      }
      if (tags && tags.length > 0) {
        tags.forEach(tag => {
          const tagElement = document.createElement('meta');
          tagElement.setAttribute('property', 'article:tag');
          tagElement.setAttribute('content', tag);
          document.head.appendChild(tagElement);
        });
      }
    }
    
    // Set canonical URL
    if (canonicalUrl) {
      setLinkTag('canonical', canonicalUrl);
    }
    
    // Clean up function to remove article tags
    return () => {
      if (type === 'article' && tags && tags.length > 0) {
        document.querySelectorAll('meta[property="article:tag"]').forEach(tag => {
          tag.remove();
        });
      }
    };
  }, [
    title, 
    description, 
    canonicalUrl, 
    image, 
    type, 
    twitterCard, 
    publishedTime, 
    modifiedTime, 
    author, 
    section, 
    tags
  ]);
  
  // This component doesn't render anything
  return null;
};

export default DynamicMetadata;