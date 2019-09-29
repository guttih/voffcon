
# Development process

There are two main branches.  **master** and **dev** branches.  The **dev** branch should always include last changes of the **master** branch.  The **master** branch should only be updated by merging from **dev** branch to **master** branch.  When fixing a bug or adding a new feature you should create a new branch for the new work.

## Branch master

The **master** branch should always be in the state "ready to be released".
This branch should only be updated by merging from **dev** to **master**.
When considering an update from **dev** to **master** only do so if you have tested the changes on **dev**.

#### Updating process from dev to master
```shell 
git checkout dev
git pull
git checkout master
git pull
git merge origin/dev
git push origin master
```

## Branch dev
The **dev** branch must never be merged into **master** without testing.
The **dev** branch should always include last changes of the **master** branch.

## Working on a brach to address an issue

### Creating a new branch

When creating a new feature you should make sure that **dev** up-to-date with **master** and create a new feature branch from **dev**.

#### Naming an issue branch

Names must be linked to a issue from the gitHub [issues page](https://github.com/guttih/voffcon/issues?q=is%3Aopen+is%3Aissue+label%3A%22feature+request%22).


The name must start with a '#' followed by the number of the issue followed by an '-' followed by the issue [type](https://github.com/guttih/voffcon/labels) (feature|bug|refactoring) followed by '-' and finally followed by a descriptive text made from the name of the issue.

Naming example for issue:
    [Unable to reuse TriggerAction Type "Ones at"](https://github.com/guttih/voffcon/issues/18) should be:

```git
#18-bug-Unable_to_reuse_TriggerAction_Type_Ones_at
````

### Update your issue branch regularly

It's a good idea to sync your branch regularly with **dev** so issues or merge issues appear promptly.

```shell
git checkout dev
git pull
git checkout #NUM-bug-the_name_of_my_bug_fix_branch
git merge origin/dev
#Here is a good idea to test your branch, and better would be to test all the dev branch.
git push origin #NUM-bug-the_name_of_my_bug_fix_branch
````

### Merging your issue branch to dev

When you have finished coding and testing for an issue, then it's time to merge it to the **dev** branch.  

Here is an example on how to merge the **#18-bug-Unable_to_reuse_TriggerAction_Type_Ones_at** branch to **dev** branch.

```shell
git checkout #18-bug-Unable_to_reuse_TriggerAction_Type_Ones_at
git pull
git checkout dev
git pull
git merge origin/#18-bug-Unable_to_reuse_TriggerAction_Type_Ones_at
````


## Other older stuff I should delete or add as issues

þegar card krassar þá má það alls ekki krassa servernum, eins og gerist þegar 
	device4 = new Device('57e2a6f74a43074811a0720f', maxValue);
	hefur rangt id á device-i.

Búa til síðu sem inniheldur forritið sem hlaða ská upp á tækið
  sú síða býður þér uppá að skrifa inn ip addressu, password á wifi-ið og nafn fyrir tækið.
  generate code takki. sem mun búa til kóða sem copy peista má inn í arduino IDE.

make more nice dashbord, eggxpecially for user who are normal users.

do documentation on built, in objects

Þessi eigindi ættu að vera til á öllum hlutum vistaðir í gagnagrunn.
 -last modified: dateTime
 -last created: dateTime
 -og það er spurning um hvort ekki yrði líka bætt við tveimur eigindum í viðbót
 -kannski last modified by : userID
 -kannski created by : userID

todo: when user changes his own access and he looses the access to change,
the user interface shows him like he can change the access but he cannot change anyting
this is because the middleware authenticateControlOwnerUrl reports an error but
the client javascript does not pick that kind of error, that is req.flash( error.  
When he removes his own access we need to direct him to the control list page.
