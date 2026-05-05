import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  profileImageUrl = 'https://i.pinimg.com/736x/02/3c/78/023c7839633d38b5951066e268dd4475.jpg';
}
