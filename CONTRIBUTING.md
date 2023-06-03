# Contributor's guidelines for Waistline

If you have opened this document purposely, it means you are interested in contributing to the Waistline project. First of all, thank you for your interest in contributing, you are awesome!
Every contribution is helpful, and I thank you for your effort. To ensure the process of contributing is as smooth as possible, here are a few guidelines for you to follow.
Please take a moment to review this document in order to make the contribution process easy and effective for everyone involved.


## Opening an issue

Opening issues on GitHub is a way of drawing the attention of the project maintainer(s). You can open an issue for two major reasons. Either to pitch in an idea (feature request) or to report a bug.
Before opening a new issue, browse through the issue tracker to see if the issue hasn't already been reported by another user. There's a chance that the feature you wish to request or the bug you experienced has already been reported. You can check out closed issues too. With the new features on GitHub, you can easily check if an issue has been submitted before. You can do this by typing a few words into the search bar and you will get suggestions for similar issues. If you have confirmed that the issue hasn't been opened before, go ahead and [open an issue](https://github.com/davidhealey/waistline/issues/new).

### Requesting a feature

As already explained above:

- Search for existing issues with similar feature requests. It's possible somebody has already asked for this feature or provided a pull request that we're still discussing.
- Provide a clear and detailed explanation of the feature you want and why it's important to add. Please try to request features that will be useful to the majority of users and not just a small subset.
- If the feature is complex, consider writing some initial documentation for it. If we do end up accepting the feature, it will need to be documented and this will also help us to understand it better ourselves.
- Attempt a pull request: If you are able to, start writing some code. If you can write some code, this will speed up the process.

### Bug reports

Sincere apologies for any inconvenience this error may have caused you. I put effort into making this app rid of bugs, but not all of them can be exterminated at once. These reports are valuable, and I appreciate you reporting any bugs you find.

- Ensure you're running the latest version of the software.
- Confirm if it's actually a bug and not an error caused by a plugin on your device. Test with other devices to verify.
- If the same issue persists after testing on other devices, then it is indeed a bug.

Here are a few tips and steps to follow if you want to report a bug:

* Include steps to reproduce and/or sample code to recreate the bug.
* I'll also need to know what version of the app you're using.
* Your version of Android and the device manufacturer are helpful too. Since there can be variants of Android that may affect things (such as x86).
* Include logcats of crashes if it is possible.

Finally, please be patient. The developer has a lot of things to do. But rest assured that the bug report will receive adequate attention and will consequently be fixed. If you are a developer, you can fork the repository and try to fix it yourself.


## Commit guidelines

The developer encourages more small commits over one large commit. Small, focused commits make the review process easier and are more likely to be accepted. It is also important to summarize the changes made with brief commit messages. If the commit fixes a specific issue, it is also good to note that in the commit message.

The commit message should start with a single line that briefly describes the changes. That should be followed by a blank line and then a more detailed explanation. As a good practice, use commands when writing the message (instead of "I added ..." or "Adding ...", use "Add ...").

Before committing, check for unnecessary whitespace with `git diff --check`.

For further recommendations, see [Pro Git Commit Guidelines](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project#Commit-Guidelines "Pro Git Commit Guidelines").


## Pull request guidelines

The following guidelines can increase the likelihood that your pull request will get accepted:

* Work on topic branches.
* Follow the commit guidelines.
* Keep the patches on topic, focused, and atomic.
* Try to avoid unnecessary formatting and clean-up where reasonable.

A pull request should contain the following:

* At least one commit (all of which should follow the commit guidelines).
* Title that summarizes the issue.
* Description that briefly summarizes the changes.

After submitting a pull request, you should get a response within the next 7 days. If you do not, don't hesitate to ping the thread.


## Creating a pull request

If you don't know how to create a pull request, this section will help you to get started.

Here's a detailed article on how to [Create a pull request](https://help.github.com/articles/creating-a-pull-request).

Simply put, the way to create a pull request is to:

1. Fork the repository of the project which in this case is [Waistline](https://github.com/davidhealey/waistline).
2. Commit modifications and changes to your fork.
3. Send a [pull request](https://help.github.com/articles/creating-a-pull-request) to the original repository you forked your repository from in step 1.


## Code contribution

Do you have ideas of some new cool functionalities, a bug fix, or other code you wish to contribute? This is the perfect section to guide you on that path.

### Build and test your project

Make sure your project is building and running on your local machine and every change you made doesn't explicitly affect another feature of the project. Also, check for any gradle or runtime errors.

If you have Docker, you can use the _Dockerfile_ to set up the development environment with all required dependencies:
```sh
sudo docker build -t waistline -f ./docker/Dockerfile .
```
Then execute the following command to start a container with an interactive shell:
```sh
sudo docker run -it -p 8000:8000 -v $(pwd):/waistline/app/ --name waistline_app waistline /bin/sh
```
If you don't want to use Docker, you need to install the dependencies manually. Hava a look at the _Dockerfile_ in the _docker/_ directory to see which dependencies you need.

Before you can build the project for the first time, you need to install the node packages and add the platforms:
```sh
npm install
cordova platform add browser
cordova platform add android
```

Now you should be able to build and run the app in the browser on [localhost](http://localhost:8000):
```sh
cordova run browser
```

To build an APK for Android, use the following command:
```sh
cordova build android
```
If the build succeeded, you should find the APK under `./platforms/android/app/build/outputs/apk/debug/app-debug.apk`.

You can also run the app on an emulator or on your phone connected via adb:
```sh
cordova run android  # to build first and then run
cordova run android --nobuild --noprepare  # if you already built
```

To start the Docker container again after it stopped, use the `docker start` command:
```sh
sudo docker start -i waistline_app
```

Check [Docker docs](https://docs.docker.com/) for more info on Docker.

### Explain your work

At the top of every patch, you should include a description of the problem you are trying to solve, how you solved it, and why you chose the solution you implemented. If you are submitting a bug fix, it is also incredibly helpful if you can describe/include a reproducer for the problem in the description as well as instructions on how to test for the bug and verify that it has been fixed.


## Contact

For further inquiries, you can contact the developer by [opening an issue](https://github.com/davidhealey/waistline/issues/new) on the repository.

You can also check out the developer's profile [here](https://github.com/davidhealey).

***Thank you for your interest in contributing to Waistline. I appreciate all the help with finding and fixing bugs, making performance improvements, and other tasks. Every contribution is helpful, and I thank you for your effort.***
