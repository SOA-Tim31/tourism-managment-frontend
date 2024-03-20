import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { BlogService } from '../blog.service';
import { BlogPost } from '../model/blogpost.model';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TourAuthoringService } from '../../tour-authoring/tour-authoring.service';
import { Equipment } from '../../tour-authoring/tour/model/equipment.model';
import { Tour } from '../../tour-authoring/tour/model/tour.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { TourEquipmentService } from '../../tour-authoring/tour_equipment.service';
import { AdministrationService } from '../../administration/administration.service';

@Component({
  selector: 'xp-blogpost-form',
  templateUrl: './blogpost-form.component.html',
  styleUrls: ['./blogpost-form.component.css']
})



export class BlogpostFormComponent implements OnChanges,OnInit {
  
  @Output() blogPostsUpdated = new EventEmitter<null>();
  @Input() blogPost: BlogPost;
  @Input() shouldEdit: boolean = false;
  @Input() shouldEditDraft: boolean = false;
  
  tour:Tour;
    tourId:number;
    equipmentLIst:Equipment[]=[];
    equipment:String[]=[];


  constructor(private a: AdministrationService,private equipmentService: TourEquipmentService,private formBuilder: FormBuilder,private tourService:TourAuthoringService,private service: BlogService, private tokenStorage: TokenStorage, private router: Router, private route: ActivatedRoute) { }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tourId = params['id']; 
      console.log('ID ture:', this.tourId);
      if(this.tourId !==0){
        this.getTourEquipment(this.tourId);
      }
      
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.blogPostForm.reset();
    if(this.shouldEdit){
      this.blogPostForm.patchValue({title: this.blogPost.title || '',
      description: this.blogPost.description || '',
      imageURLs: this.blogPost.imageURLs});
    }
  }

  blogPostForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    imageURLs: new FormControl(''),
    equipment: this.buildEquipmentChecklist() // Dodajte polje za opremu
  })


  addBlogPost(): void{
    console.log(this.blogPostForm.value)

    //const imageURLsString = this.blogPostForm.value.imageURLs;
    //const imageURLs = imageURLsString;


    const blogPost = {
      id: 0,
      authorId: this.tokenStorage.getUserId() || 0,
      tourId:this.tourId,
      username: null,
      title: this.blogPostForm.value.title || '',
      description: this.blogPostForm.value.description || '',
      creationDate: new Date(),
      imageURLs: this.blogPostForm.value.imageURLs || '',
      comments: [],
      ratings: [],
      status: 'PUBLISHED'
    }
    this.selectedEquipment.forEach(e => {
      console.log("Opis " +e.description);
    });
    this.service.addBlogPost(blogPost).subscribe({
      next: (_) => {
        this.blogPostsUpdated.emit();
        if(this.tourId === 0){
          this.router.navigate(['/blog'])
        }else{
          this.router.navigate(['/blog']);

        }
      }
    });
    
    
  }


  addBlogPostDraft(): void{
    console.log(this.blogPostForm.value)

    //const imageURLsString = this.blogPostForm.value.imageURLs;
    // const imageURLs = imageURLsString
    //   ? imageURLsString.split(',').map(url => String(url.trim()))
    //   : [];


    const blogPost = {
      id: 0,
      authorId: this.tokenStorage.getUserId() || 0,
      tourId:0,
      username: null,
      title: this.blogPostForm.value.title || '',
      description: this.blogPostForm.value.description || '',
      creationDate: new Date(),
      imageURLs:  this.blogPostForm.value.imageURLs || '',
      comments: [],
      ratings: [],
      status: 'DRAFT'
    }

    this.service.addBlogPost(blogPost).subscribe({
      next: (_) => {
        this.blogPostsUpdated.emit();
      }
    });

    this.blogPostForm.reset();
    
  }

  postBlogPostDraft(): void{
    console.log(this.blogPostForm.value)

    const imageURLsString = this.blogPostForm.value.imageURLs;
    const imageURLs = imageURLsString
      ? imageURLsString.split(',').map(url => String(url.trim()))
      : [];


      const blogPost = {
        id: this.blogPost.id,
        authorId: this.blogPost.authorId,
        tourId:0,
        username: this.blogPost.username,
        title: this.blogPostForm.value.title || '',
        description: this.blogPostForm.value.description || '',
        creationDate: new Date(),
        imageURLs: this.blogPostForm.value.imageURLs || '',
        comments: this.blogPost.comments,
        ratings: this.blogPost.ratings,
        status: 'PUBLISHED'
      }

    this.service.updateBlogPost(blogPost).subscribe({
      next: (_) => {
        this.blogPostsUpdated.emit();
        this.router.navigate(['/blog']);
      }
    });

    
    
  }

  updateBlogPost(): void{

    const imageURLsString = this.blogPostForm.value.imageURLs;
    const imageURLs = imageURLsString
      ? imageURLsString.split(',').map(url => String(url.trim()))
      : [];

    const blogPost = {
      id: this.blogPost.id,
      authorId: this.blogPost.authorId,
      tourId:0,
      username: this.blogPost.username,
      title: this.blogPostForm.value.title || '',
      description: this.blogPostForm.value.description || '',
      creationDate: this.blogPost.creationDate,
      imageURLs: this.blogPostForm.value.imageURLs || '',
      comments: this.blogPost.comments,
      ratings: this.blogPost.ratings,
      status: this.blogPost.status
    }

    this.service.updateBlogPost(blogPost).subscribe({
      next: (_) => {
        this.blogPostsUpdated.emit()
        if(!this.shouldEditDraft) {
          this.router.navigate(['/blog/',this.blogPost.id]);
        }
        else {
          this.router.navigate(['/blog/create-post']);
        }
      }
    })
    

  }

  

  shouldDisplayEquipment(): boolean {
    return this.equipmentLIst && this.equipmentLIst.length > 0; // Vraća true ako postoji oprema
  }

  getTourEquipment(tourId: number) {
    this.a.getEquipment().subscribe({
      next: (result:PagedResults<Equipment>) => {
        this.equipmentLIst = result.results; 
        this.equipmentLIst.forEach(e => {
          this.equipment.push(e.name);
        });
        console.log(this.equipmentLIst);
        this.equipmentLIst.forEach(e => {
          console.log(e);
        });
      this.blogPostForm.setControl('equipment', this.buildEquipmentChecklist());
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }
  private buildEquipmentChecklist(): FormArray {
    const controls = this.equipmentLIst.map(() => {
      return this.formBuilder.control(false);
    });
    return this.formBuilder.array(controls);
  }
  
  get selectedEquipment(): Equipment[] {
    const selectedIndexes = this.blogPostForm.value.equipment
      .map((checked: boolean, index: number) => checked ? index : -1)
      .filter((index: number) => index !== -1);
  
    const selectedEquipment = selectedIndexes.map((index: number) => this.equipmentLIst[index]);
    return selectedEquipment;
  }


    
}
