import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogPost } from '../model/blogpost.model';
import { BlogPostRating } from '../model/blog-post-rating.model';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';
import { BlogService } from '../blog.service';
import { BlogPostComment } from '../model/blog-post-comment.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'xp-blog-post-detail',
  templateUrl: './blog-post-detail.component.html',
  styleUrls: ['./blog-post-detail.component.css']
})
export class BlogPostDetailComponent implements OnInit {
  postId: number;
  post: BlogPost;
  @Output() postUpdated = new EventEmitter<null>();
  
  constructor(private service: BlogService, private route: ActivatedRoute,private tokenStorage: TokenStorage, private router: Router) { }

  currentImageIndex: number = 0;
  isUpvoted: boolean;
  isDownvoted: boolean;
  overall_rating: number = 0;
  upvote_count:number = 0;
  downvote_count: number = 0;
  showPopup = false;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.postId = +params['id'];
      this.getById(this.postId);
    });
  }

  getById(blogPostId: number): void{
    this.service.getById(blogPostId).subscribe({
      next: (result: BlogPost) => {
        this.post = result;
        console.log(this.post);
        this.post.creationDate = new Date(this.post.creationDate);
        this.checkRating();
        this.GetOverallRating();
      },
      error: (err: any) =>{
        console.log(err);
      }
    })
  }

  GetOverallRating() {
    this.upvote_count = 0;
    this.downvote_count = 0;
    if(this.post.ratings != null) {
      for (const rating of this.post.ratings) {
        if(rating.isPositive) {
          this.upvote_count++;
        }
        else {
          this.downvote_count++;
        }
      }
      this.overall_rating = this.upvote_count - this.downvote_count;
    }
  }
  checkRating():void {
    if(this.post.ratings != null) {
       for (const rating of this.post.ratings) {
        if(rating.userId == this.tokenStorage.getUserId()) {
          if(rating.isPositive) {
            this.isUpvoted = true;
            this.isDownvoted = false;
          }
          else if(rating.isPositive == false) {
            this.isUpvoted = false;
            this.isDownvoted = true;
          }
          else {
            this.isUpvoted = false;
            this.isDownvoted = false;
          }
        }
       }
    }
  }

  editedComment: BlogPostComment;

  closePopup() {
    this.showPopup = false;
  }

  openEditPopup(comment: BlogPostComment) {
    // Create a copy of the comment to avoid modifying the original comment immediately
    this.editedComment = { ...comment };
    this.showPopup = true;
  }

  saveChanges() {
    // Make a copy of the edited comment to avoid directly modifying the original comment
    const editedCommentCopy = { ...this.editedComment };

    // Implement your save logic here
    // You can update the original comment in the comments array or send it to a service
    this.service.updateComment(this.post.id, editedCommentCopy).subscribe({
      next: (_) => {
        // Refresh the comments after saving changes
        this.ngOnInit();
      }
    });

    this.showPopup = false;
  }

  isClosed(blogPost: BlogPost){
    console.log("dosao dovde")
    return blogPost.status == 'CLOSED'
  }
  

  upvote() {
    if(this.isUpvoted) {
      this.isUpvoted = false;
      this.service.removeRating(this.post.id,this.tokenStorage.getUserId()).subscribe({
        next: () => { this.ngOnInit(); }
      });
    }
    else {
      this.isUpvoted = true;
      this.isDownvoted = false;
      const rating: BlogPostRating = {
        userId: this.tokenStorage.getUserId(),
        creationTime: new Date(),
        isPositive: true,
      }
      this.service.addRating(this.post.id, rating).subscribe({
        next: () => { this.ngOnInit(); }
      });
    }
  }

  downvote() {
    if(this.isDownvoted) {
      this.isDownvoted = false;
      this.service.removeRating(this.post.id, this.tokenStorage.getUserId()).subscribe({
        next: () => { this.ngOnInit(); }
      });
    }
    else {
      this.isUpvoted = false;
      this.isDownvoted = true;
      const rating: BlogPostRating = {
        userId: this.tokenStorage.getUserId(),
        creationTime: new Date(),
        isPositive: false,
      }
      this.service.addRating(this.post.id, rating).subscribe({
        next: () => { this.ngOnInit(); }
      });
    }
  }

  get currentImage(): string {
    return this.post.imageURLs ? this.post.imageURLs[this.currentImageIndex] : '';
  }

  get showNavArrows(): boolean {
    return this.post.imageURLs != null && this.post.imageURLs.length > 1;
  }

  nextImage() {
    if (this.showNavArrows) {
      this.currentImageIndex = (this.currentImageIndex + 1) % (this.post.imageURLs?.length ?? 1);
    }
  }

  prevImage() {
    if (this.showNavArrows) {
      this.currentImageIndex = (this.currentImageIndex - 1 + (this.post.imageURLs?.length ?? 1)) % (this.post.imageURLs?.length ?? 1);
    }
  }

  navigateToUpdateForm() {
    this.router.navigate(['/blog/update-post/' + this.postId]);
  }

  deletePost(){
    this.service.deleteBlogPost(this.post).subscribe({
      next: (_) => {
        this.router.navigate(['/blog']);
      }
    })
  }

  commentForm = new FormGroup({
    text: new FormControl('', [Validators.required]),
  });

  
  addComment(): void {
    const comment: BlogPostComment= {
      userId: this.tokenStorage.getUserId() || 0 ,
      username: null || "",
      blogId: this.post.id,
      text: this.commentForm.value.text || "",
      creationTime: new Date(),
      lastUpdatedTime: new Date(), 
    }
    this.service.addComment(this.post.id, comment).subscribe({
      next: () => { this.ngOnInit(); }
    })
    this.commentForm.reset();
  }

  showEditDeleteButtons(commentuserId:number):boolean {
    return commentuserId == this.tokenStorage.getUserId();
  }

  deleteComment(userId: number, dateTime: Date):void {
    console.log(userId);
    console.log(dateTime);
    console.log(this.post.id);
    
    this.service.deleteComment(this.post.id, userId, dateTime).subscribe({
      next: () => {
        this.ngOnInit();
      }
    })
  }
}
