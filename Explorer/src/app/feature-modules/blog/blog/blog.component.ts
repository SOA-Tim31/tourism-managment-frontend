import { Component } from '@angular/core';
import { BlogPost } from '../model/blogpost.model';
import { BlogService } from '../blog.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Router } from '@angular/router';

@Component({
  selector: 'xp-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent {
  blogPosts: BlogPost[] = [];
  filteredPosts: BlogPost[] = [];

  constructor(private service: BlogService, private router: Router) {}

  ngOnInit(): void {
    this.getBlogPosts();
  }

  getBlogPosts(): void {
    this.service.getBlogPosts().subscribe({
      next: (result: PagedResults<BlogPost>) => {
        this.blogPosts = result.results;
        this.blogPosts.forEach(post => {
          console.log(post);
          post.creationDate = new Date(post.creationDate);
        });
        this.blogPosts.forEach(post => {
          if(post.status != 'DRAFT') {
            this.filteredPosts.push(post);
          }
        })
      },
      error: (err: any) =>{
        console.log(err);
      }
    })
  }

  navigateToPostCreation() {
    this.router.navigate(['/blog/create-post']);
  }

}
