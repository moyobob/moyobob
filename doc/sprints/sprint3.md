# Sprint 3

## Revision

* Updated Design & Planning 
  * Model Design
  * View Design

## Progress

#### Major Difficulties

* Dependency design 
* Modifications sharing
* Role distributing

#### Contributions

* Backend: Kangwook Lee
  * Party model
  * PartyState model
  * Party view
  * User authentication(signup, signin, signout view)
  * Websocket consumer
  * Redis cache setting
  * Dependency update(django_redis, django_channels)

* Frontend
  * Service
    * UserService implementation: Yeonghyeon Kim 
    * PartyService implementation: Hyunsuk Choo

  * Component  
    * SignInComponent: Yeonghyeon Kim
    *  LobbyComponent(in progress): Hyunsuk Choo 
    *  LobbyListItemComponent: Hyunsuk Choo
    *  PartyComponent(in progress) : Hyemin Kim

    ![image-20181105163428103](/Users/hyeminkim/Library/Application Support/typora-user-images/image-20181105163428103.png)



* Design & Planning update: Kangwook Lee

#### Test Coverage

* Tool: CircleCI, Codecov
* view of the test progress using CircleCI 

![img](/Users/hyeminkim/Library/Application Support/typora-user-images/image-20181105162858084.tiff)

* The overall coverage metric

![img](/Users/hyeminkim/Library/Application Support/typora-user-images/image-20181105170223393.tiff)

* The list of classes with lowest coverage: No class. The coverage of every class is 100%.



Sprint Report is written by Hyemin Kim
