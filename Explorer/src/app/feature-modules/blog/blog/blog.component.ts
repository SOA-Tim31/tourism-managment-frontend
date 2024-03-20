import { Component } from '@angular/core';
import { BlogPost } from '../model/blogpost.model';
import { BlogService } from '../blog.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Router } from '@angular/router';
import {GoogleAnalyticsService} from "../../../infrastructure/google-analytics/google-analytics.service";
import { Tour } from '../../tour-authoring/tour/model/tour.model';
import { TourAuthoringService } from '../../tour-authoring/tour-authoring.service';

@Component({
  selector: 'xp-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent {
  blogPosts: BlogPost[] = [];
  tour:Tour[]=[]

  constructor(private service: BlogService,
              private router: Router,
              private tourService:TourAuthoringService,
              private googleAnalytics: GoogleAnalyticsService) {}

  ngOnInit(): void {
    this.googleAnalytics.sendPageView(window.location.pathname);

    this.getBlogPosts();
  }

  getBlogPosts(): void {
    this.service.getBlogPosts().subscribe({
      next: (result: PagedResults<BlogPost>) => {
        this.blogPosts = result.results
          .filter(post => post.status !== 'DRAFT' && post.status !== 'CLOSED');
  
        this.blogPosts.forEach(post => {
          console.log(post.creationDate);
          post.creationDate = new Date(post.creationDate);
          console.log(post);
        });
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  
  navigateToPostCreation() {
    this.router.navigate(['/blog/create-post']);
  }
  getFamousBlogPosts(): void {
    this.service.getBlogPosts().subscribe({
      next: (result: PagedResults<BlogPost>) => {
        this.blogPosts = result.results;
        this.blogPosts.forEach(post => {
          console.log(post);
          post.creationDate = new Date(post.creationDate);
        });
        this.blogPosts = this.blogPosts.filter(post => post.status === 'FAMOUS');
      },
      error: (err: any) =>{
        console.log(err);
      }
    })
  }
  getActiveBlogPosts(): void {
    this.service.getBlogPosts().subscribe({
      next: (result: PagedResults<BlogPost>) => {
        this.blogPosts = result.results;
        this.blogPosts.forEach(post => {
          console.log(post);
          post.creationDate = new Date(post.creationDate);
        });
        this.blogPosts = this.blogPosts.filter(post => post.status === 'ACTIVE');
      },
      error: (err: any) =>{
        console.log(err);
      }
    })
  }
}
