# Sahaayak
Sahaayak is a platform for the talented vendors and people who all are willing to work but not getting a right platform or chance to convert their passion and talent into their scalable profession. Creating a good and fair competition in the market allowing them to grow. This will allow customers to have a bunch of talents to select among the best combination (rate + rating).

# API Schema

#### /users
| Route      | Method   | Description                     | Authorization      |
|------------|----------|---------------------------------|--------------------|
| /          | [GET]    | get all users                   | (Admin)            |
| /login/    | [POST]   | user login                      | (Buyer, Vendor)    |
| /signup/   | [POST]   | user signup                     | (Anyone)           |
| /:vendorId | [GET]    | get vendor details              | (Anyone)           |
| /:buyerId  | [GET]    | get buyer details               | (this.user,Admin)  |
| /:Id       | [PATCH]  | update user details             | (this.user)        |
| /:Id       | [DELETE] | get user details                | (this.user, Admin) |
| /vendors   | [GET]    | get list of all vendors details | (Admin)           |
#### /catagories
| Route        | Method   | Description           | Authorization |
|--------------|----------|-----------------------|---------------|
| /            | [GET]    | get all catagories    | (Anyone)      |
| /            | [POST]   | add new catagory      | (Admin)       |
| /:catagoryId | [PATCH]  | Update catagory by Id | (Admin)       |
| /:catagoryId | [DELETE] | Delete catagory by Id | (Admin)       |
#### /services
| Route             | Method   | Description                             | Authorization   |
|-------------------|----------|-----------------------------------------|-----------------|
| /                 | [GET]    | get all services                        | (Anyone)        |
| /                 | [POST]   | add new service                         | (Vendor)        |
| /:catagoryName    | [GET]    | Get all services in given catagory      | (Anyone)        |
| /:serviceId       | [GET]    | Get service by given Id                 | (Anyone)        |
| /:serviceId       | [PATCH]  | Update service by Id                    | (Vendor)        |
| /:serviceId       | [DELETE] | Delete service by Id                    | (Vendor, Admin) |
| /vendors/vendorId | [GET]    | get all services provided by the vendor | (Anyone)        |
#### /reviews
| Route               | Method   | Description                                            | Authorization                                 |
|---------------------|----------|--------------------------------------------------------|-----------------------------------------------|
| /:serviceId         | [GET]    | get all reviews                                        | (Anyone)                                      |
| /:serviceId         | [POST]   | add review to a service                                | (Anyone ~ serviceId->vendor)                  |
| /:serviceId         | [PATCH]  | update review to a service given by the logged in user | (loggedIn->userId==serviceId->review->userId) |
| /:serviceId         | [DELETE] | delete review of service where review                  | (review->userId==logged in userId, Admin)     |
| /:serviceId/:userId | [GET]    | get review of given service by given user              | (Anyone)                                      |
| /vendors/:vendorId  | [GET]    | get all reviews of all services provided by the vendor | (Vendor)                                      |

## How it will create an Imapct?
* Increase Sales: This will allow local businessmen, shopkeepers specially the new ones to scale their business and spread their special offers and sales quickly to the public. 
* Curb pollution: caused by plastic banners and posters, pamphlets to a greater extent.
* Women Employment: We will focus on home sitting female workers like beauticians, designer tailors, etc.

## Communication

Our chat channel is to be found on Gitter [here](https://gitter.im/dsciitpatna/Sahaayak)

## Requirements
* node --version >= 6
* npm --version >= 3

## License

This repository is under [MIT License](LICENSE) 
