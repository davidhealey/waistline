# Contributor's guidelines for Waistline

If you have opened this document purposely, it means you are interested in contributing to the Waistline project. First of all, thank you for your interest in contributing, you are awesome!
Every contribution is helpful and I thank you for your effort. To ensure the process of contributing is as smooth as possible, here are a few guidelines for you to follow.
Please take a moment to review this document in order to make the contribution process easy and effective for everyone involved.


## Opening an Issue

Opening issues on Github are a way of drawing the attention of the project maintainer(s). You can open an issue for two major reasons. Either to pitch in an idea(feature request) or, to report a bug.
Before opening a new issue, browse through the issue tracker if the issue hasn't already been reported by another user. There's a chance that the feature you wish to request for, or, the bug you experienced has already been reported. You can check out closed issues too. With the new features on Github, you can easily know if an issue has been submitted before. You can do this by typing a few words on the title bar and you will get suggestions for similar issues. If you have confirmed that that the issue hasn't been opened before, go ahead and [open an issue](https://github.com/davidhealey/waistline/issues/new)


### Requesting a feature

As already explained above;

- Search Issues for similar feature requests. It's possible somebody has already asked for this feature or provided a pull request that we're still discussing.

- Provide a clear and detailed explanation of the feature you want and why it's important to add. Please try to request features that will be useful to the majority of users and not just a small subset.

- If the feature is complex, consider writing some initial documentation for it. If we do end up accepting the feature it will need to be documented and this will also help us to understand it better ourselves.

- Attempt a Pull Request; If you are able to, start writing some code. If you can write some code then that will speed the process along.

### Bug reports

Sincere apologies for any inconvenience this error may have caused you. I put effort into making this app rid of bugs. But, all of them can't totally be exterminated at once. These reports are valuable and I appreciate you for reporting them.

- Ensure you're running the latest version of the software
- Confirm if it's actually a bug and not an error caused by a plugin on your device. Test with other devices to verify
- If the same issue persists after testing on other devices then it is indeed a bug.

Here are a few tips and steps to follow if you want to report a bug;

* Include steps to reproduce and/or sample code to recreate the bug.
* I'll also need to know what version of the app you're using
* The version of Android in the device in question
* Sometimes the manufacturer is helpful too. Since there can be variants of Android that may affect things (such as x86).
* Include logcats of crashes if it is possible.

Finally, please be patient. The developer has a lot of things to do. But, be assured that the bug report will receive adequate attention, and will consequently be fixed. If you are a developer,  you can fork the repository and try to fix it yourself.


---


## Commit Guidelines

The developer encourages more small commits over one large commit. Small, focused commits make the review process easier and are more likely to be accepted. It is also important to summarise the changes made with brief commit messages. If the commit fixes a specific issue, it is also good to note that in the commit message.

The commit message should start with a single line that briefly describes the changes. That should be followed by a blank line and then a more detailed explanation. As a good practice, use commands when writing the message (instead of "I added ..." or "Adding ...", use "Add ...").

Before committing check for unnecessary whitespace with `git diff --check`.

For further recommendations, see [Pro Git Commit Guidelines](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project#Commit-Guidelines "Pro Git Commit Guidelines").


## Pull Request Guidelines

The following guidelines can increase the likelihood that your pull request will get accepted:

* Work on topic branches.
* Follow the commit guidelines.
* Keep the patches on topic, focused, and atomic.
* Try to avoid unnecessary formatting and clean-up where reasonable.

A pull request should contain the following:

* At least one commit (all of which should follow the Commit Guidelines)
* Title that summarises the issue
* Description that briefly summarises the changes

After submitting a pull request, you should get a response within the next 7 days. If you do not, don't hesitate to ping the thread.


## Creating a pull request

If you don't know how to create a pull request, this section will help you to get started.

Here's a detailed content on how to [Create a pull request](https://help.github.com/articles/creating-a-pull-request)

Simply put, the way to create a Pull request is first to;

1. Fork the repository of the project which in this case is [Waistline](https://github.com/davidhealey/waistline)
2. Commit modifications and changes to your fork
3. Send a [pull request](https://help.github.com/articles/creating-a-pull-request) to the original repository you forked your repository from in step 1


---


## Code Contribution

Do you have ideas of some new cool functionalities, a bug fix or other code you wish to contribute? This is the perfect section to guide you on that path.

### Test Your Project

Make sure your project is building and running on your local machine and every change you made doesn't explicitly affect another feature of the project. Also, check for any gradle or runtime errors.

If you have Docker, you can use _browser.Dockerfile_ to build and run this project locally:
```sh
sudo docker build -t waistline:browser -f ./docker/browser.Dockerfile .
sudo docker run -d -p 80:8000 -v $(pwd):/usr/src/ --name waistline_browser waistline:browser
```
Once the app has been built, you should be able to access it in your browser via [localhost](http://localhost:80).

You can check the build status using the `docker logs` command:
```sh
sudo docker logs --follow waistline_browser
```

To apply any local code changes, simply restart the Docker container:
```sh
sudo docker restart waistline_browser
```

To build for Android, you can use _android.Dockerfile_:
```sh
sudo docker build -t waistline:android -f ./docker/android.Dockerfile .
sudo docker run -v $(pwd):/waistline/app/ --name waistline_android waistline:android
```
If the build succeeded, you should find the APK under `./platforms/android/app/build/outputs/apk/debug/app-debug.apk`.

You can also launch the container interactively to execute your own commands:
```sh
sudo docker run -it -v $(pwd):/waistline/app/ --name waistline_android waistline:android /bin/sh
```

To start the container again after it stopped, use the `docker start` command:
```sh
sudo docker start -i waistline_android
```

We depend on an externally generated Docker image at the Android build. If you wish, you can build it locally in your repositories' directory by:
```sh
git clone https://github.com/alvr/alpine-android
cd alpine-android/docker
sudo docker build -t local/alpine-android-base:jdk8 --build-arg JDK_VERSION="8" -f ./base.Dockerfile .
sudo docker build -t local/alpine-android:android-30-jdk8 --build-arg BUILD_TOOLS="30.0.3" --build-arg TARGET_SDK="30" --build-arg JDK_VERSION="8" -f ./android.Dockerfile .
```
Replace "alvrme/alpine-android:android-30-jdk8" by "local/alpine-android:android-30-jdk8" and then run the commands for _android.Dockerfile_ as stated above.

To stop any container use `sudo docker stop <container-name>`. Check [Docker docs](https://docs.docker.com/) for more info on Docker.

To build for Android or the browser on the command line (without Docker), you can adapt the commands from the files in the _docker/_ directory.

### Explain Your Work

At the top of every patch, you should include a description of the problem you are trying to solve, how you solved it, and why you chose the solution you implemented. If you are submitting a bug fix, it is also incredibly helpful if you can describe/include a reproducer for the problem in the description as well as instructions on how to test for the bug and verify that it has been
fixed.


---


## Contact

For further inquiries, you can contact the developer by [opening an issue](https://github.com/davidhealey/waistline/issues/new) on the repository.

You can also check out the developer's profile [here](https://github.com/davidhealey).


***Thank you for your interest in contributing to Waistline. I appreciate all the help with finding and fixing bugs, making performance improvements, and other tasks. Every contribution is helpful and I thank you for your effort.***
