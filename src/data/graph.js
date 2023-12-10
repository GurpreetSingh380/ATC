import { ILS_WEST, ILS_EAST, polygonCoords, polygonCoordsOpp, STAR1, STAR2, STAR3, STAR4, STAR5, STAR6, STAR7, STAR_RELAY1, STAR_RELAY2 } from './polygons'

class Node{
    constructor(star, index, altitude, adj){
        this.star = star;
        this.index = index;
        this.height = altitude;
        this.adj = adj;
    }
}

const n2=new Node(1, 1, 16000, []);
const n1=new Node(1, 0, 20000, [n2]);
console.log(n1.adj[0].altitude);

