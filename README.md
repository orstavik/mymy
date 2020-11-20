# myemye
A pure Myers diff in javascript. 

## Why myemye?

It cleans up the result so as to cut out 'match-in-the-middle` problems, such as individual characters or single words needlessly breaking up an otherwise clear replacement. Implemented as pure functions which make the result easily reversable (you can use the output to go from a new version to an old version, and vice versa, simply). The output is also made most efficient by identifying when text is copied or moved, and not just deleted or inserted.
