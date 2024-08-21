import { contentfulClient, contentfulGraphql } from '~/lib/contentful/client';
import { BlogPost } from '~/components/ui/blog-post-card';
import { FeaturedBlogPostList } from '~/components/ui/featured-blog-post-list';

export default async function ContentfulPage() {
  const GetBlogPostsQuery = contentfulGraphql(`
    query GetBlogPosts {
      blogPostCollection {
        items {
          sys {
            id}
          title
          excerpt
          author
          published
          image {
            description
            url
          }
        }
      }
    }  
  `);

  const { data, ...restResponse } = await contentfulClient.query(GetBlogPostsQuery, {});

  console.dir(restResponse, { depth: null });

  if (!data) {
    return <h1>no data</h1>;
  }

  if (!data.blogPostCollection) {
    return <h1>no blogPostCollection</h1>;
  }
 
  if (!data.blogPostCollection.items) {
    return <h1>no items</h1>;
  }

  const posts: BlogPost[] = data.blogPostCollection.items
    .filter((item) => item !== null)
    .map((item) => {
      if (!item.title) {
        return null;
      }

      return {
        id: item.sys.id,
        title: item.title,
        author: item.author ?? 'No Author',
        date: item.published ? new Date(item.published).toLocaleDateString() : 'No Date',
        content: item.excerpt ?? '',
        image:
          item.image && item.image.url && item.image.description
            ? {
                src: item.image.url,
                altText: item.image.description,
              }
            : null,

        // @todo
        href: '#',
      };
    })
    .filter((item) => item !== null);

  return (
    <FeaturedBlogPostList
      title="Plant Life"
      description="Expert Tips & Inspiration for Every Plant Lover"
      cta={{ href: '#', label: 'View All' }}
      posts={posts}
    />
  );
}
