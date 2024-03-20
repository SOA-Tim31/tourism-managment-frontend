import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { BlogPost } from './model/blogpost.model';
import { environment } from 'src/env/environment';
import { BlogPostRating } from './model/blog-post-rating.model';
import { BlogPostComment } from './model/blog-post-comment.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  constructor(private http: HttpClient) { }

  getBlogPosts(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>('https://localhost:44333/api/blog/blogpost');
  }

  getById(blogPostId: number): Observable<BlogPost> {
    return this.http.get<BlogPost>(environment.apiHost + 'blog/blogpost/' + blogPostId);
  }

  addBlogPost(blogPost: BlogPost): Observable<BlogPost>{
    return this.http.post<BlogPost>(environment.apiHost + 'blog/blogpost', blogPost);
  }

  updateBlogPost(blogPost: BlogPost): Observable<BlogPost>{
    return this.http.put<BlogPost>(environment.apiHost + 'blog/blogpost/' + blogPost.id, blogPost);
  }

  deleteBlogPost(blogPost: BlogPost): Observable<BlogPost>{
    return this.http.delete<BlogPost>(environment.apiHost + 'blog/blogpost/' + blogPost.id);
  }
  addRating(id: number, rating: BlogPostRating): Observable<BlogPost>{
    return this.http.post<BlogPost>(environment.apiHost + 'blog/blogpost/' + id + '/ratings', rating);
  }
  removeRating(blogId: number, userId: number): Observable<BlogPost>{
    return this.http.delete<BlogPost>(environment.apiHost + 'blog/blogpost/' + blogId + '/ratings/' + userId );
  }
  addComment(id: number, comment: BlogPostComment): Observable<BlogPost> {
    return this.http.post<BlogPost>(environment.apiHost + 'blog/blogpost/' + id + '/comments', comment);
  }
  deleteComment(blogId: number, userId:number, dateTime: Date):Observable<BlogPost> {
    console.log(userId);
    const dateObj = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
    console.log('Pre formatiranja:', dateObj);
    dateObj.setHours(dateObj.getHours() + 1);
    const formattedDateTime =  dateObj.toISOString();
    console.log('Date Time:', formattedDateTime);
    console.log(blogId);
    
    return this.http.delete<BlogPost>(environment.apiHost + 'blog/blogpost/' +  blogId + '/comments/' + userId + '/' + formattedDateTime );
  }
  updateComment(blogId:number, comment:BlogPostComment):Observable<BlogPost> {
    return this.http.put<BlogPost>(environment.apiHost + 'blog/blogpost/' + blogId + '/comments', comment);
  }
}
