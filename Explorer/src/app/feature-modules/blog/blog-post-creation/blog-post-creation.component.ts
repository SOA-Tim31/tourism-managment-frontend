import { Component } from '@angular/core';
import { BlogService } from '../blog.service';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';
import { BlogPost } from '../model/blogpost.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Router } from '@angular/router';


@Component({
  selector: 'xp-blog-post-creation',
  templateUrl: './blog-post-creation.component.html',
  styleUrls: ['./blog-post-creation.component.css']
})
export class BlogPostCreationComponent {

  userDrafts: BlogPost [] = [];
  showPopup = false

  constructor(private service: BlogService, private tokenStorage: TokenStorage, private router: Router) { }

  closePopup(){
    this.showPopup = false;
  }

  showDraftsPopup(): void{
    this.service.getBlogPosts().subscribe({
      next: (result: BlogPost[]) => {
        this.userDrafts = result.filter(post => post.status === 'DRAFT' 
          && post.authorId === this.tokenStorage.getUserId());;
        this.userDrafts.forEach(post => {
          post.creationDate = new Date(post.creationDate);

          this.showPopup = true;
        });
      },
      error: (err: any) =>{
        console.log(err);
      }
    })
  }

  editDraft(draft: BlogPost): void {
    this.router.navigate(['/blog/update-post/' + draft.id]);
    // Handle the edit action for the selected draft
  }

  deleteDraft(draft: BlogPost): void {
    this.service.deleteBlogPost(draft).subscribe({
      next: (_) => {
        this.closePopup();
      }
    })
  }
  
}
