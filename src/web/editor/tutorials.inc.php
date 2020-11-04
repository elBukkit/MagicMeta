<?php ?>

<div id="tutorialMask" class="mask">
&nbsp;
</div>

<div id="welcomeTutorial" class="tutorial" data-next="editorTutorial">
    <div style="font-weight: bold; padding-bottom: 1em">Welcome to the Magic spell editor!</div>
    <div>This editor will assist you in creating and editing spell configurations. If this is your first time here,
        it is strongly recommended that you follow this brief tutorial!</div>
    <div>Just click anywhere on the screen to proceed to the next slide.</div>
    <div style="padding: 0.5em"><span style="font-weight:bold">Press the escape key</span> at any point to close this tutorial.</div>
</div>

<div id="editorTutorial" class="tutorial" data-my="left top+50" data-at="left bottom" data-of="saveButton" data-next="newTutorial">
    <div>This is the main editor area. This is where you will type in your configurations!</div>
    <div>The editor was made specifically for Magic config creation, it will check for errors, highlight your
    code for readability, and automatically suggest new properties or values in a context-aware way.</div>
    <div>You won't have to leave this page to look up names for materials, particles or anything else you'll need to type here!</div>
    <div style="margin-top: 2em">
        The editor comes preloaded with a simple example configuration that describes the general anatomy of a spell. It is a good
        idea to read through this configuration, paying special attention to its comments, in order to understand how the spell works.
    </div>
</div>

<div id="newTutorial" class="tutorial balloon top" data-my="left top" data-at="left bottom" data-of="newButton" data-next="exampleTutorial">
    <div>Use this button to clear the editor and start with a completely blank canvas.</div>
</div>

<div id="exampleTutorial" class="tutorial balloon top" data-my="left top" data-at="right-10 bottom" data-of="newButton" data-next="saveTutorial">
    <div>This drop-down contains several example spell templates you can load into the editor.</div>
    <div>It is highly recommended that you load and read through each one if you are not familiar with the basics of spell configuration!</div>
    <div>Each option represents a common use pattern found in many magic spells, though they are really only here to give you ideas. Once
    you are familiar with the basics of spell anatomy, and the spell actions available to you, the possibilities are endless!</div>
</div>

<div id="saveTutorial" class="tutorial balloon top" data-my="left top" data-at="left bottom" data-of="saveButton" data-next="downloadTutorial">
    <div>When you have something you want to try out, you can use the Save button.</div>
    <div>You will be prompted with instructions on how to load your changes to your server.</div>
</div>

<div id="downloadTutorial" class="tutorial balloon top" data-my="left top" data-at="left bottom" data-of="downloadButton" data-next="referenceTutorial">
    <div>If you'd like to save or view your configuration locally, click the Download button to download the config.</div>
    <div>You can also drop that file into the <span class="code">plugins/Magic/spells</span> folder on your server, use <span class="code">/magic load</span> and your
    spell will be available!</div>
    <div>For players to use new spells, you will need to add it to a path config or a shop, or provide some other way for it to be obtainable.</div>
</div>

<div id="referenceTutorial" class="tutorial balloon top" data-my="left top" data-at="left bottom" data-of="referenceButton" data-next="tutorialTutorial">
    <div>For detailed information on all spell actions, effect classes and just about everything else in Magic, click the Reference button to open the reference guide.</div>
</div>

<div id="tutorialTutorial" class="tutorial balloon top" data-my="left top" data-at="left bottom" data-of="helpButton" data-next="finishedTutorial">
    <div>
        Click this button if you ever wish to see this tutorial again.
    </div>
</div>

<div id="finishedTutorial" class="tutorial">
    <div>Thank you for reading through the tutorial!</div>
    <div>Best of luck with your new creations! If you invent something amazing please share it with the community on the
    <a href="https://www.spigotmc.org/threads/magic.28645/" target="_blank">SpigotMC Discussion Board</a> or in <a href="https://discord.gg/Vk5nK5h" target="_blank">the Magic discord channel<a/>.</div>
</div>