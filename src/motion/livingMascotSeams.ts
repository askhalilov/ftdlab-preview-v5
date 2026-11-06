/** Source-textured overlap strips along actual partition boundaries. These
 * expose existing approved jacket pixels; they do not reconstruct anatomy. */
export const livingMascotSeams = [
  { id: 'arm-left', path: 'M 538 410 L 556 423 L 569 439 L 577 456 L 578 473 L 570 490 L 556 506 L 557 521 L 574 534 L 586 551 L 580 568 L 565 578 L 554 583 L 507 585', width: 32 },
  { id: 'arm-right', path: 'M 708 406 L 708 420 L 707 443 L 707 462 L 708 481 L 710 500 L 713 519 L 719 538 L 724 557 L 727 576 L 729 595 L 734 614 L 738 633 L 743 652 L 751 670 L 774 677', width: 32 },
  { id: 'leg-left', path: 'M 625 598 L 573 599 L 554 604 L 551 619 L 548 639 L 545 659 L 542 679 L 540 699 L 537 719 L 535 739 L 533 759 L 529 779 L 517 831', width: 40 },
  { id: 'leg-right', path: 'M 632 593 L 652 594 L 672 595 L 693 595 L 714 620 L 718 641 L 722 662 L 724 683 L 725 704 L 726 725 L 727 746 L 728 767 L 728 788 L 734 809', width: 40 },
  { id: 'head', path: 'M 544 385 L 553 391 L 570 399 L 690 399 L 697 396 L 712 391', width: 32 },
] as const
