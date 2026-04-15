# Copilot Prompt Cheatsheet

Use these prompts directly in Copilot Chat to trigger the right mode by intent.

## Frontend mode prompts

1. Mode frontend: ajoute un composant React dans src/components avec Tailwind uniquement, accessibilite incluse, et gere les cas de donnees vides.
2. Mode frontend: modifie cette page Next.js dans src/app sans casser le comportement existant, en restant coherent avec les patterns du fichier.
3. Mode frontend: cree une UI accessible (labels, aria, clavier), puis verifie les edge cases avant de finaliser.

## Reviewer mode prompts

1. Mode reviewer: relis ces fichiers et donne les findings par severite (bugs/regressions d abord), puis accessibilite, edge cases, performance.
2. Mode reviewer: audit rapide de ce composant, format court: ce qui est bien, a ameliorer, critique.
3. Mode reviewer: fais une review orientee accessibilite clavier + aria + contraste, avec corrections proposees.

## Git assistant mode prompts

1. Mode git: resume les changements en 1 phrase par fichier et propose un message de commit conventionnel.
2. Mode git: propose un plan de commits (un commit = un changement logique) avec message type feat/fix/refactor.
3. Mode git: donne les commandes git non destructives pour commit et push, et explique chaque commande.

## Combo prompts

1. Mode reviewer puis mode git: review complete, ensuite propose le meilleur message de commit.
2. Mode frontend puis mode reviewer: implemente la feature puis fais une auto-review stricte avant de conclure.

## Quick tip

If you need a strict review output, add: 
"Donne les findings d abord, avec severite et references de fichiers."
