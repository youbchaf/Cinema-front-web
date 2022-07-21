import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {colors} from "@angular/cli/utilities/color";
import {CinemaService} from "../services/cinema.service";
import {error} from "@angular/compiler-cli/src/transformers/util";

@Component({
  selector: 'app-cinema',
  templateUrl: './cinema.component.html',
  styleUrls: ['./cinema.component.css']
})
export class CinemaComponent implements OnInit {


  constructor(public cinemaService:CinemaService) { }

  public villes : any
  public cinemas : any
  public salles : any
  public currentVille : any
  public currentCinema : any
  public currentProjection: any
  public selectedTickets =  new Array();

  ngOnInit(): void {
      this.cinemaService.getVilles()
        .subscribe(data => {
            this.villes = data
            this.onGetCinemas(this.villes._embedded.villes[0])
          },
          error => {
            console.log(error)
          }
        )


  }


  onGetCinemas(v: any) {
    this.currentVille = v
    this.salles = undefined
  this.cinemaService.getCinemas(v)
    .subscribe( data => {
      this.cinemas = data;
        this.onGetSalle(this.cinemas._embedded.cinemas[0])


      },
      error => {
        console.log(error)
      })
  }
  onGetSalle(c: any){
    this.currentCinema = c
    this.cinemaService.getSalles(c)
      .subscribe(data => {

        this.salles = data
        this.salles._embedded.salles.forEach((salle:any) => {
          this.cinemaService.getProjection(salle)
            .subscribe(data => {
              salle.projections = data

              },
              error => {
              console.log(error)
              })
        })


      }, error=>{
        console.log(error)

      })
  }

  onGetPlaces(p: any) {
    this.currentProjection = p
    this.cinemaService.getTicketsPlaces(p)
      .subscribe(data => {
          this.currentProjection.tickets = data
        this.selectedTickets=[];

        },
        error => {
          console.log(error)
        })
  }

  onSelectTicket(t: any) {
    if(!t.selected){
      t.selected=true

      this.selectedTickets?.push(t)
    }
    else{
      t.selected=false
      this.selectedTickets?.splice(this.selectedTickets?.indexOf(t),1)
    }

    console.log(this.selectedTickets)

  }

  getTicketClass(t: any) {
    let str="btn "
    if(t.reserve==true){
      str+="btn-danger"
    }
    else if(t.selected){
      str+="btn-warning"
    }
    else{
      str+="btn-success"
    }
    return str
  }

  onPayTickets(dataForm: any,currentProjection:any) {
    let tickets: any[] = [];
    this.selectedTickets.forEach(t => {
      tickets.push(t.id)
    })
    dataForm.tickets=tickets
    this.cinemaService.payerTickets(dataForm)
      .subscribe(data => {
          alert("Tickets réservés avec succès !")
        this.onGetPlaces(this.currentProjection)
      }, error => {

      })
  }
}
